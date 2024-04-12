import Fastify, { FastifyInstance } from 'fastify';
import auth from '@fastify/auth';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import express from '@fastify/express';
import helmet from '@fastify/helmet';
import dotenv from 'dotenv';
import serverless from 'serverless-http';
import { router as albumRoute } from './routes/album-route.js';
import albumTagsRoute from './routes/album-tag-route.js';
import { router as authRoute } from './routes/auth-route.js';
import { router as locationRoute } from './routes/location-route.js';
import { router as photoRoute } from './routes/photo-route.js';
import { initialiseDynamodbTables } from './services/initialise-dynamodb-tables.js';

dotenv.config();

export const app: FastifyInstance = Fastify({
  logger: true,
});

await app.register(cors, {
  allowedHeaders: ['Origin, Content-Type, Accept, Authorization, X-Requested-With'],
  credentials: true,
  methods: ['GET, POST, PUT, DELETE, OPTIONS'],
  optionsSuccessStatus: 200,
  origin: (origin, cb) => {
    console.log('##### origin: ', origin);
    const allowedOrigins = ['http://localhost:9000', process.env.ALBUM_URL];
    if (origin === undefined || allowedOrigins.indexOf(origin) > -1) {
      cb(null, true);
      return;
    }

    cb(new Error('This origin is not allowed'), false);
  },
  preflightContinue: true,
});
await app.register(cookie);
await app.register(helmet);
await app.register(auth);

/** Temporary fix for the CORS issue**/
await app.register(express);
const corsHeader = (req: any, res: any, next: any) => {
  console.log('##### Request API:', req.url, '| Method:', req.method);
  const allowedOrigins = ['http://localhost:9000', process.env.ALBUM_URL];
  const origin = req.headers.origin as string;
  if (allowedOrigins.indexOf(origin) > -1) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if ('OPTIONS' === req.method) {
    res.sendStatus(200);
  } else {
    next();
  }
};
app.use(corsHeader);
/** Temporary fix for the CORS issue**/

// Route
app.use('/api/auth', authRoute);
app.use('/api/albums', albumRoute);
app.register(albumTagsRoute);
app.use('/api/photos', photoRoute);
app.use('/api/location', locationRoute);

try {
  await app.listen({ port: 3000 });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}

initialiseDynamodbTables().then(() => console.log('Finish verifying DynamoDB tables.'));
export const handler = serverless(app as any);
