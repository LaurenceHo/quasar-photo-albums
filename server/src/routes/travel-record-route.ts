import { Hono } from 'hono';
import TravelRecordController from '../controllers/travel-record-controller.js';
import { HonoEnv } from '../env.js';
import { verifyJwtClaim, verifyUserPermission } from './auth-middleware.js';

const controller = new TravelRecordController();
const app = new Hono<HonoEnv>();

app.get('/api/travelRecords', controller.findAll);

app.post('/api/travelRecords', verifyJwtClaim, verifyUserPermission, controller.create);

app.put('/api/travelRecords', verifyJwtClaim, verifyUserPermission, controller.update);

app.delete('/api/travelRecords/:recordId', verifyJwtClaim, verifyUserPermission, controller.delete);

export default app;
