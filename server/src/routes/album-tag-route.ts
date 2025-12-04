import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import AlbumTagController from '../controllers/album-tag-controller.js';
import { HonoEnv } from '../env.js';
import { CreateTagSchema } from '../types/request-schemas.js';
import { verifyJwtClaim, verifyUserPermission } from './auth-middleware.js';

const controller = new AlbumTagController();
const app = new Hono<HonoEnv>();

app.get('/api/albumTags', controller.findAll);

app.post(
  '/api/albumTags',
  verifyJwtClaim,
  verifyUserPermission,
  zValidator('json', CreateTagSchema),
  controller.create,
);

app.delete('/api/albumTags/:tagId', verifyJwtClaim, verifyUserPermission, controller.delete);

export default app;
