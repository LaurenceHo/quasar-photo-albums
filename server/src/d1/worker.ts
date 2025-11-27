import logger from 'pino';
import { D1Service } from './d1-service';
import TravelRecordService from './travel-record-service';
import UserService from './user-service';
import AlbumService from './album-service';
import AlbumTagService from './album-tag-service';
import AggregationService from './aggregation-service';

/**
 * Environment bindings for the Cloudflare Worker.
 */
interface Env {
  DB: D1Database;
  DEV_WORKER_SECRET: string;
  PROD_WORKER_SECRET: string;
}

/**
 * Generic handler for CRUD operations on a D1Service.
 */
async function handleServiceRequest<T>(
  service: D1Service<T>,
  request: Request,
  path: string,
  basePath: string,
  requiredFields: string[],
): Promise<Response> {
  const id = path.startsWith(`${basePath}/`) ? path.split('/')[2] : null;
  try {
    // LIST all items
    if (path === basePath && request.method === 'GET') {
      const items = await service.getAll();
      return new Response(JSON.stringify(items), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    // GET a single item
    if (id && request.method === 'GET') {
      const item = await service.getById(id);
      if (!item) return new Response(`${basePath.slice(1)} not found`, { status: 404 });
      return new Response(JSON.stringify(item), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    // CREATE a new item
    if (path === basePath && request.method === 'POST') {
      const body = (await request.json()) as any;
      if (!Array.isArray(body)) {
        if (requiredFields.some((field) => !body[field])) {
          return new Response(`Missing required fields: ${requiredFields.join(', ')}`, {
            status: 400,
          });
        }
      }

      await service.create(
        Array.isArray(body)
          ? body.map((item) => ({ ...item, createdAt: new Date().toISOString() }))
          : { ...body, createdAt: new Date().toISOString() },
      );
      return new Response(`${basePath.slice(1)} created`, { status: 201 });
    }
    // UPDATE an existing item
    if (id && request.method === 'PUT') {
      const body = (await request.json()) as any;
      const existingItem = await service.getById(id);
      if (!existingItem) return new Response(`${basePath.slice(1)} not found`, { status: 404 });
      await service.update(id, {
        ...body,
        updatedAt: new Date().toISOString(),
      });
      return new Response(`${basePath.slice(1)} updated`, { status: 200 });
    }
    // DELETE an item
    if (id && request.method === 'DELETE') {
      // For album tags, we don't strictly check existence via getById because the ID is the tag string itself
      // and we want to allow deletion even if getById might behave differently.
      // However, for consistency, we can keep it or skip it.
      // AlbumTagService.delete handles cascading deletes.
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
    const secret = env.PROD_WORKER_SECRET || env.DEV_WORKER_SECRET;
    if (!secret) {
      logger().error('Worker secret not configured');
      return new Response('Server misconfigured', { status: 500 });
    }
    const provided = request.headers.get('x-worker-secret');
    if (!provided || provided !== secret) {
      return new Response('Unauthorized', { status: 401 });
    }
    const url = new URL(request.url);
    const path = url.pathname;
    const db = env.DB;

    const albumService = new AlbumService(db);
    const travelRecordService = new TravelRecordService(db);
    const userService = new UserService(db);
    const albumTagService = new AlbumTagService(db);
    const aggregationService = new AggregationService(db);

    logger().info({ path, method: request.method }, 'Request received');

    if (path.startsWith('/travel_records')) {
      return handleServiceRequest(travelRecordService, request, path, '/travel_records', [
        'travelDate',
        'departure',
        'destination',
        'transportType',
        'distance',
      ]);
    }

    if (path.startsWith('/albums')) {
      return handleServiceRequest(albumService, request, path, '/albums', [
        'id',
        'year',
        'albumName',
        'isPrivate',
      ]);
    }

    if (path.startsWith('/album-tags')) {
      return handleServiceRequest(albumTagService, request, path, '/album-tags', [
        'tag',
      ]);
    }

    if (path.startsWith('/aggregations')) {
      if (request.method === 'GET') {
        let type = path.split('/')[2];
        if (!type) {
          type = url.searchParams.get('type') || '';
        }

        if (type === 'albumsWithLocation') {
          const includePrivate = url.searchParams.get('includePrivate') === 'true';
          const data = await aggregationService.getAlbumsWithLocation(includePrivate);
          return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        if (type === 'featuredAlbums') {
          const data = await aggregationService.getFeaturedAlbums();
          return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        if (type === 'countAlbumsByYear') {
          const includePrivate = url.searchParams.get('includePrivate') === 'true';
          const data = await aggregationService.getCountAlbumsByYear(includePrivate);
          return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        return new Response('Aggregation type not found', { status: 404 });
      } else {
        return new Response('Method Not Allowed', { status: 405 });
      }
    }

    if (path.startsWith('/user_permissions') && request.method === 'GET') {
      const uid = request.headers.get('X-Uid');
      const email = request.headers.get('X-Email');
      if (!uid || !email) {
        return new Response('Missing uid or email', { status: 400 });
      }
      const user = await userService.findOne({ uid, email });
      return new Response(JSON.stringify(user), {
        status: user ? 200 : 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response('Not found', { status: 404 });
  },
};
