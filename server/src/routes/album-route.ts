import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import AlbumController from '../controllers/album-controller.js';
import { HonoEnv } from '../env.js';
import {
  CreateAlbumSchema,
  DeleteAlbumSchema,
  UpdateAlbumSchema,
} from '../types/request-schemas.js';
import { verifyJwtClaim, verifyUserPermission } from './auth-middleware.js';

const controller = new AlbumController();
const app = new Hono<HonoEnv>();

app.get('/api/albums/:year', controller.findAll);

app.post(
  '/api/albums',
  verifyJwtClaim,
  verifyUserPermission,
  zValidator('json', CreateAlbumSchema),
  controller.create,
);

app.put(
  '/api/albums',
  verifyJwtClaim,
  verifyUserPermission,
  zValidator('json', UpdateAlbumSchema),
  controller.update,
);

app.delete(
  '/api/albums',
  verifyJwtClaim,
  verifyUserPermission,
  zValidator('json', DeleteAlbumSchema),
  controller.delete,
);

export default app;
