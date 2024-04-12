import express from 'express';
import AlbumController from '../controllers/album-controller.js';
import { verifyJwtClaim, verifyUserPermission } from './auth-middleware.js';

export const router = express.Router();
const controller = new AlbumController();

router.get('', controller.findAll);

router.post('', verifyJwtClaim, verifyUserPermission, controller.create);

router.put('', verifyJwtClaim, verifyUserPermission, controller.update);

router.delete('/:albumId', verifyJwtClaim, verifyUserPermission, controller.delete);
