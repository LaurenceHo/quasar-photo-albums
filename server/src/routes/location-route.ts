import { Hono } from 'hono';
import LocationController from '../controllers/location-controller.js';
import { HonoEnv } from '../env.js';

const controller = new LocationController();
const app = new Hono<HonoEnv>();

app.get('/api/location/search', controller.findAll);

export default app;
