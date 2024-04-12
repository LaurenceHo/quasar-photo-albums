import express from 'express';
import LocationController from '../controllers/location-controller.js';

export const router = express.Router();
const controller = new LocationController();

router.get('/search', controller.findAll);
