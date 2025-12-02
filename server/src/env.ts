import { AsyncLocalStorage } from 'node:async_hooks';

export interface Env {
  DB: D1Database;
  WORKER_SECRET: string;
  AWS_S3_BUCKET_NAME: string;
  AWS_REGION_NAME: string;
  VITE_IMAGEKIT_CDN_URL: string;
  AWS_ACCESS_KEY_ID?: string;
  AWS_SECRET_ACCESS_KEY?: string;
  JWT_SECRET?: string;
  GOOGLE_PLACES_API_KEY?: string;
  VITE_GOOGLE_CLIENT_ID?: string;
  ALBUM_URL?: string;
  ENVIRONMENT?: string;
  DEVELOPMENT?: string;
}

export const envStorage = new AsyncLocalStorage<Env>();
