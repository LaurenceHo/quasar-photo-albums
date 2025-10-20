import { Database } from '@cloudflare/d1';
import dotenv from 'dotenv';
import logger from 'pino';
import { app } from './app.js';
import { D1Service } from './d1/d1-service';
import TravelRecordService from './d1/travel-record-service';
import { initialiseDynamodbTables } from './services/initialise-dynamodb-tables.js';
import { initialiseS3Bucket } from './services/initialise-s3-bucket.js';

dotenv.config();

interface Env {
  DB: Database;
}

async function handleServiceRequest<T>(
  service: D1Service<T>,
  request: Request,
  path: string,
  basePath: string,
  requiredFields: string[],
): Promise<Response> {
  const id = path.startsWith(`${basePath}/`) ? path.split('/')[2] : null;

  try {
    if (path === basePath && request.method === 'GET') {
      const items = await service.getAll();
      return new Response(JSON.stringify(items), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    if (id && request.method === 'GET') {
      const item = await service.getById(id);
      if (!item) return new Response(`${basePath.slice(1)} not found`, { status: 404 });
      return new Response(JSON.stringify(item), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    if (path === basePath && request.method === 'POST') {
      const body = await request.json();
      if (requiredFields.some((field) => !body[field])) {
        return new Response(`Missing required fields: ${requiredFields.join(', ')}`, {
          status: 400,
        });
      }
      await service.create({
        ...body,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      });
      return new Response(`${basePath.slice(1)} created`, { status: 201 });
    }
    if (id && request.method === 'PUT') {
      const body = await request.json();
      const existingItem = await service.getById(id);
      if (!existingItem) return new Response(`${basePath.slice(1)} not found`, { status: 404 });
      await service.update(id, body);
      return new Response(`${basePath.slice(1)} updated`, { status: 200 });
    }
    if (id && request.method === 'DELETE') {
      const existingItem = await service.getById(id);
      if (!existingItem) return new Response(`${basePath.slice(1)} not found`, { status: 404 });
      await service.delete(id);
      return new Response(`${basePath.slice(1)} deleted`, { status: 200 });
    }
    return new Response('Not found or method not allowed', { status: 404 });
  } catch (e: any) {
    return new Response(`Error: ${e.message}`, { status: 500 });
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    const travelRecordService = new TravelRecordService(env.DB);

    if (path.startsWith('/travel-records')) {
      return handleServiceRequest(travelRecordService, request, path, '/travel-records', [
        'destination',
        'date',
      ]);
    }

    return new Response('Not found', { status: 404 });
  },
};

await initialiseS3Bucket();
logger().info('Finish verifying S3 bucket.');

await initialiseDynamodbTables();
logger().info('Finish verifying DynamoDB tables.');

await app.listen({ port: 3000 });
logger().info('App is listening on port 3000.');
