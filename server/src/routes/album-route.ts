import { Hono } from 'hono';
import AlbumController from '../controllers/album-controller.js';
import { HonoEnv } from '../env.js';
import { verifyJwtClaim, verifyUserPermission } from './auth-middleware.js';

const controller = new AlbumController();
const app = new Hono<HonoEnv>();

app.get('/api/albums/:year', controller.findAll);

app.post('/api/albums', verifyJwtClaim, verifyUserPermission, controller.create);

app.put('/api/albums', verifyJwtClaim, verifyUserPermission, controller.update);

app.delete('/api/albums', verifyJwtClaim, verifyUserPermission, controller.delete);

export default app;
