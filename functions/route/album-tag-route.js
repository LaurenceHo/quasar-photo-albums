const express = require('express');
const { getFirestore } = require('firebase-admin/firestore');
const helpers = require('../helpers');
const router = express.Router();

router.get('', async (req, res) => {
  const albumTags = [];
  const docRef = getFirestore().collection('album-tags');
  docRef
    .orderBy('tag', 'asc')
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        albumTags.push({ ...doc.data(), id: doc.id });
      });
      res.send(albumTags);
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send({ status: 'Server error' });
    });
});

router.post('', helpers.verifyJwtClaim, helpers.verifyUserPermission, (req, res) => {
  const tag = req.body;
  const tagRef = getFirestore().collection('album-tags').doc(tag.id);

  delete tag.id;

  tagRef
    .set(tag)
    .then(() => res.send({ status: 'Album tag created' }))
    .catch((error) => {
      console.log(`Failed to create document: ${error}`);
      res.status(500).send({ status: 'Server error' });
    });
});

router.delete('/:tagId', helpers.verifyJwtClaim, helpers.verifyUserPermission, async (req, res) => {
  const tagId = req.params['tagId'];
  const tagRef = getFirestore().doc(`album-tags/${tagId}`);
  tagRef
    .delete()
    .then(() => res.send({ status: 'Tag deleted' }))
    .catch((error) => {
      console.log(error);
      res.status(500).send({ status: 'Server error' });
    });
});

module.exports = router;
