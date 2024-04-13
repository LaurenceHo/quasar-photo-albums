import auth from '@fastify/auth';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import multipart from '@fastify/multipart';
import throttle from '@fastify/throttle';
import dotenv from 'dotenv';
import Fastify, { FastifyInstance } from 'fastify';
import serverless from 'serverless-http';
import albumRoute from './routes/album-route.js';
import albumTagsRoute from './routes/album-tag-route.js';
import { verifyJwtClaim, verifyUserPermission } from './routes/auth-middleware.js';
import authRoute from './routes/auth-route.js';
import locationRoute from './routes/location-route.js';
import photoRoute from './routes/photo-route.js';
import { initialiseDynamodbTables } from './services/initialise-dynamodb-tables.js';

const ACCEPTED_MAX_FILE_SIZE = 5 * 1024 * 1024;

dotenv.config();

export const app: FastifyInstance = Fastify();

await app.register(cors, {
  allowedHeaders: ['Origin, Content-Type, Accept, Authorization, X-Requested-With'],
  credentials: true,
  methods: ['GET, POST, PUT, DELETE, OPTIONS'],
  optionsSuccessStatus: 200,
  origin: (origin, cb) => {
    const allowedOrigins = ['http://localhost:9000', process.env.ALBUM_URL];
    if (origin === undefined || allowedOrigins.indexOf(origin) > -1) {
      cb(null, true);
      return;
    }

    cb(new Error('This origin is not allowed'), false);
  },
  preflightContinue: true,
});
await app.register(cookie, { secret: process.env.JWT_SECRET as string });
await app.register(helmet);
await app.register(auth);
await app.register(multipart, {
  limits: {
    fieldSize: 256, // Max field value size in bytes
    fields: 10, // Max number of non-file fields
    fileSize: ACCEPTED_MAX_FILE_SIZE, // For multipart forms, the max file size in bytes
    files: 1, // Max number of file fields
    headerPairs: 1000, // Max number of header key=>value pairs
    parts: 500, // For multipart forms, the max number of parts (fields + files)
  },
});
await app.register(throttle, {
  bytesPerSecond: 1024 * 128, // 128KB/s
});

// Route
app.addHook('onRequest', (request, reply, done) => {
  console.log('##### Request: ', request.method, request.url);
  done();
});
app.decorate('verifyJwtClaim', verifyJwtClaim).decorate('verifyUserPermission', verifyUserPermission);

app.register(authRoute);
app.register(albumRoute);
app.register(albumTagsRoute);
app.register(photoRoute);
app.register(locationRoute);

try {
  await app.listen({ port: 3000 });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}

initialiseDynamodbTables().then(() => console.log('Finish verifying DynamoDB tables.'));
export const handler = serverless(app as any);
