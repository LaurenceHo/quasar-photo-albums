import { Hono } from 'hono';
import PhotoController from '../controllers/photo-controller.js';
import { HonoEnv } from '../env.js';
import { verifyJwtClaim, verifyUserPermission } from './auth-middleware.js';

const controller = new PhotoController();
const app = new Hono<HonoEnv>();

app.get('/api/photos/upload/:albumId', verifyJwtClaim, verifyUserPermission, controller.create);

app.get('/api/photos/:year/:albumId', controller.findAll);

app.put('/api/photos', verifyJwtClaim, verifyUserPermission, controller.update);

app.put('/api/photos/rename', verifyJwtClaim, verifyUserPermission, controller.rename);

app.delete('/api/photos', verifyJwtClaim, verifyUserPermission, controller.delete);

export default app;
