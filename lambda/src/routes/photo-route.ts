import express from 'express';
import multer from 'multer';
import PhotoController from '../controllers/photo-controller';
import { verifyJwtClaim, verifyUserPermission } from './auth-middleware';
import { get } from 'radash';

const ACCEPTED_MAX_FILE_SIZE = 5 * 1024 * 1024;

export const router = express.Router();

const controller = new PhotoController();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: ACCEPTED_MAX_FILE_SIZE,
  },
  fileFilter: (req, file, cb: any) => {
    const shouldAccept = get(req, 'header["content-length"]', 0) <= ACCEPTED_MAX_FILE_SIZE;
    shouldAccept ? cb(null, true) : cb(new Error('Payload is too large'), false);
  },
});

router.get('/:albumId', controller.findAll);

router.delete('', verifyJwtClaim, verifyUserPermission, controller.delete);

router.put('', verifyJwtClaim, verifyUserPermission, controller.update);

router.put('/rename', verifyJwtClaim, verifyUserPermission, controller.rename);

router.post('/upload/:albumId', verifyJwtClaim, verifyUserPermission, upload.single('file'), controller.create);
