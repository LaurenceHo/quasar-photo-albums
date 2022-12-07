import express from 'express';
import { createPhotoAlbumTag, deletePhotoAlbumTag, queryAlbumTags } from '../services/firestore-service';
import { verifyJwtClaim, verifyUserPermission } from './helpers';

export const router = express.Router();

router.get('', async (req, res) => {
  queryAlbumTags()
    .then((albumTags) => res.send(albumTags))
    .catch((error) => {
      console.log(error);
      res.status(500).send({ status: 'Server error' });
    });
});

router.post('', verifyJwtClaim, verifyUserPermission, (req, res) => {
  const tag = req.body;

  createPhotoAlbumTag(tag)
    .then(() => res.send({ status: 'Album tag created' }))
    .catch((error: Error) => {
      console.log(`Failed to create document: ${error}`);
      res.status(500).send({ status: 'Server error' });
    });
});

router.delete('/:tagId', verifyJwtClaim, verifyUserPermission, async (req, res) => {
  const tagId = req.params['tagId'];

  deletePhotoAlbumTag(tagId)
    .then(() => res.send({ status: 'Tag deleted' }))
    .catch((error: Error) => {
      console.log(error);
      res.status(500).send({ status: 'Server error' });
    });
});
