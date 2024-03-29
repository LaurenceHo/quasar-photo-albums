import express from 'express';
import AlbumTagController from '../controllers/album-tag-controller';
import { verifyJwtClaim, verifyUserPermission } from './auth-middleware';

export const router = express.Router();
const controller = new AlbumTagController();

router.get('', controller.findAll);

router.post('', verifyJwtClaim, verifyUserPermission, controller.create);

router.delete('/:tagId', verifyJwtClaim, verifyUserPermission, controller.delete);
