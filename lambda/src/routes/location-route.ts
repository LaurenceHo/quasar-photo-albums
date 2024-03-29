import express from 'express';
import LocationController from '../controllers/location-controller';

export const router = express.Router();
const controller = new LocationController();

router.get('/search', controller.findAll);
