import express from 'express';
import { error }  from "firebase-functions/logger";
import { createPhotoAlbumTag, deletePhotoAlbumTag, queryAlbumTags } from '../services/firestore-service';
import { verifyJwtClaim, verifyUserPermission } from './helpers';

export const router = express.Router();

router.get('', async (req, res) => {
  queryAlbumTags()
    .then((albumTags) => res.send(albumTags))
    .catch((err: Error) => {
      error(err);
      res.status(500).send({ status: 'Server error' });
    });
});

router.post('', verifyJwtClaim, verifyUserPermission, (req, res) => {
  const tag = req.body;

  createPhotoAlbumTag(tag)
    .then(() => res.send({ status: 'Album tag created' }))
    .catch((err: Error) => {
      error(`Failed to create document: ${err}`);
      res.status(500).send({ status: 'Server error' });
    });
});

router.delete('/:tagId', verifyJwtClaim, verifyUserPermission, async (req, res) => {
  const tagId = req.params['tagId'];

  deletePhotoAlbumTag(tagId)
    .then(() => res.send({ status: 'Tag deleted' }))
    .catch((err: Error) => {
      error(err);
      res.status(500).send({ status: 'Server error' });
    });
});
