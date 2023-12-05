import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import express, { Application, Request, Response } from 'express';
import admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin/lib/app/credential';
import helmet from 'helmet';
import serverless from 'serverless-http';
import serviceAccount from '../serviceAccountKey.json';
import { router as albumRoute } from './route/album-route';
import { router as albumTagsRoute } from './route/album-tag-route';
import { router as authRoute } from './route/auth-route';
import { router as photoRoute } from './route/photo-route';
import { errorHandler } from './utils/error-handler';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as ServiceAccount),
});

dotenv.config();

export const app: Application = express();
const corsHeader = (req: Request, res: Response, next: any) => {
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
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(helmet());
app.use(errorHandler);

// Route
app.use('/api/auth', authRoute);
app.use('/api/albums', albumRoute);
app.use('/api/albumTags', albumTagsRoute);

app.use('/api/photos', photoRoute);

export const handler = serverless(app);