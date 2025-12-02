import { Hono } from 'hono';
import AggregateController from '../controllers/aggregate-controller.js';
import { HonoEnv } from '../env.js';
import { optionalVerifyJwtClaim } from './auth-middleware.js';

const controller = new AggregateController();
const app = new Hono<HonoEnv>();

app.get('/api/aggregate/:type', optionalVerifyJwtClaim, controller.findOne);

export default app;
