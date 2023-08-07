import express from 'express';
import { error } from 'firebase-functions/logger';
import { createPhotoAlbumTagV2, queryAlbumTagsV2 } from '../services/aws-dynamodb-service';
import { deletePhotoAlbumTag } from '../services/firestore-service';
import { verifyJwtClaim, verifyUserPermission } from './helpers';

export const router = express.Router();

router.get('', async (req, res) => {
  queryAlbumTagsV2()
    .then((albumTags) => res.send(albumTags))
    .catch((err: Error) => {
      error(err);
      res.status(500).send({ status: 'Server error' });
    });
});

router.post('', verifyJwtClaim, verifyUserPermission, (req, res) => {
  const tag = req.body;

  createPhotoAlbumTagV2(tag)
    .then(() => res.send({ status: 'Album tag created' }))
    .catch((err: Error) => {
      error(err);
      res.status(500).send({ status: 'Server error' });
    });
});

router.delete('/:tagId', verifyJwtClaim, verifyUserPermission, async (req, res) => {
  const tagId = req.params['tagId'];
  // TODO, use V2 API
  deletePhotoAlbumTag(tagId)
    .then(() => res.send({ status: 'Tag deleted' }))
    .catch((err: Error) => {
      error(err);
      res.status(500).send({ status: 'Server error' });
    });
});
