import express from 'express';
import multer from 'multer';
import PhotoController from '../controllers/photo-controller';
import { verifyJwtClaim, verifyUserPermission } from './auth-middleware';

export const router = express.Router();
const controller = new PhotoController();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

router.get('/:albumId', controller.findAll);

router.delete('', verifyJwtClaim, verifyUserPermission, controller.delete);

router.put('', verifyJwtClaim, verifyUserPermission, controller.update);

router.put('/rename', verifyJwtClaim, verifyUserPermission, controller.rename);

router.post('/upload/:albumId', verifyJwtClaim, verifyUserPermission, upload.single('file'), controller.create);
