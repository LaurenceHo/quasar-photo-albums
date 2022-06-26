const express = require('express');

const helpers = require('../helpers');
const firestoreService = require('../services/firestore-service');

const router = express.Router();

router.get('', async (req, res) => {
  firestoreService
    .queryAlbumTags()
    .then((albumTags) => res.send(albumTags))
    .catch((error) => {
      console.log(error);
      res.status(500).send({ status: 'Server error' });
    });
});

router.post('', helpers.verifyJwtClaim, helpers.verifyUserPermission, (req, res) => {
  const tag = req.body;

  firestoreService
    .createPhotoAlbumTag(tag)
    .then(() => res.send({ status: 'Album tag created' }))
    .catch((error) => {
      console.log(`Failed to create document: ${error}`);
      res.status(500).send({ status: 'Server error' });
    });
});

router.delete('/:tagId', helpers.verifyJwtClaim, helpers.verifyUserPermission, async (req, res) => {
  const tagId = req.params['tagId'];

  firestoreService
    .deletePhotoAlbumTag(tagId)
    .then(() => res.send({ status: 'Tag deleted' }))
    .catch((error) => {
      console.log(error);
      res.status(500).send({ status: 'Server error' });
    });
});

module.exports = router;
