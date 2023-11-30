import express from 'express';
import { createPhotoAlbumTagV2, deletePhotoAlbumTagV2, queryAlbumTagsV2 } from '../services/aws-dynamodb-service';
import { verifyJwtClaim, verifyUserPermission } from './helpers';
import { STATUS_ERROR, STATUS_SUCCESS } from '../constants';

export const router = express.Router();

router.get('', async (req, res) => {
  queryAlbumTagsV2()
    .then((albumTags) => res.send(albumTags))
    .catch((err: Error) => {
      console.error(err);
      res.status(500).send({ status: STATUS_ERROR, message: err.message });
    });
});

router.post('', verifyJwtClaim, verifyUserPermission, (req, res) => {
  const tag = req.body;

  createPhotoAlbumTagV2(tag)
    .then(() => res.send({ status: STATUS_SUCCESS, message: 'Album tag created' }))
    .catch((err: Error) => {
      console.error(err);
      res.status(500).send({ status: STATUS_ERROR, message: err.message });
    });
});

router.delete('/:tagId', verifyJwtClaim, verifyUserPermission, async (req, res) => {
  const tagId = req.params['tagId'];

  deletePhotoAlbumTagV2(tagId)
    .then(() => res.send({ status: STATUS_SUCCESS, message: 'Tag deleted' }))
    .catch((err: Error) => {
      console.error(err);
      res.status(500).send({ status: STATUS_ERROR, message: err.message });
    });
});
