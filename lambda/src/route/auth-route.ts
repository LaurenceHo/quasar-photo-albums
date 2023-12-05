import express from 'express';
import AuthController from '../controllers/auth-controller';

export const router = express.Router();
const controller = new AuthController();

router.get('/userInfo', controller.findOne);

router.post('/verifyIdToken', controller.verifyIdToken);

router.post('/logout', controller.logout);
