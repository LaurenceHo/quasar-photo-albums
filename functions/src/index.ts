import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import express, { Application, Request, Response } from 'express';
import throttle from 'express-throttle-bandwidth';
import admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin/lib/app/credential';
import { info }  from "firebase-functions/logger";
import * as functionsV2 from 'firebase-functions/v2';
import helmet from 'helmet';
import serviceAccount from '../serviceAccountKey.json';
import { router as albumRoute } from './route/album-route';
import { router as albumTagsRoute } from './route/album-tag-route';
import { router as authRoute } from './route/auth-route';
import { router as photoRoute } from './route/photo-route';

dotenv.config();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as ServiceAccount),
});

const app: Application = express();
const corsHeader = (req: Request, res: Response, next: any) => {
  info('Request API:', req.url);
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
app.use(throttle(1024 * 128)); // throttling bandwidth

// Route
app.use('/api/auth', authRoute);
app.use('/api/albums', albumRoute);
app.use('/api/albumTags', albumTagsRoute);
app.use('/api/photos', photoRoute);

export const main = functionsV2.https.onRequest(app);
