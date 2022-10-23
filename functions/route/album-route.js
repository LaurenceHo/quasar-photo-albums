const _ = require('lodash');
const express = require('express');
const admin = require('firebase-admin');

const helpers = require('../helpers');
const firestoreService = require('../services/firestore-service');
const awsS3Service = require('../services/aws-s3-service');

// Reference:
// https://firebase.google.com/docs/reference/admin/node/firebase-admin.firestore
// https://googleapis.dev/nodejs/firestore/latest/Firestore.html

const router = express.Router();

router.get('', async (req, res) => {
  try {
    const firebaseToken = _.get(req, 'cookies.__session', '');
    let decodedClaims = null;
    let userPermission = null;
    if (firebaseToken) {
      decodedClaims = await admin.auth().verifySessionCookie(firebaseToken, true);
      userPermission = await firestoreService.queryUserPermission(decodedClaims?.uid);
    }

    const isAdmin = _.get(userPermission, 'role') === 'admin';
    if (!isAdmin) {
      res.set('Cache-control', 'public, max-age=3600');
    }
    const albumList = await firestoreService.queryPhotoAlbums(isAdmin);
    res.send(albumList);
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: 'Server error' });
  }
});

router.post('', helpers.verifyJwtClaim, helpers.verifyUserPermission, async (req, res) => {
  const album = req.body;

  firestoreService
    .createPhotoAlbum(album)
    .then(() => res.send({ status: 'Album created' }))
    .catch((error) => {
      console.log(`Failed to create document: ${error}`);
      res.status(500).send({ status: 'Server error' });
    });
});

router.put('', helpers.verifyJwtClaim, helpers.verifyUserPermission, async (req, res) => {
  const album = req.body;

  firestoreService
    .updatePhotoAlbum(album)
    .then(() => res.send({ status: 'Album updated' }))
    .catch((error) => {
      console.log(error);
      res.status(500).send({ status: 'Server error' });
    });
});

router.delete('/:albumId', helpers.verifyJwtClaim, helpers.verifyUserPermission, async (req, res) => {
  const albumId = req.params['albumId'];

  try {
    console.log('###### Delete album:', albumId);
    const result = await awsS3Service.emptyS3Folder(albumId);
    console.log('###### Delete result:', result);
    if (result.$metadata.httpStatusCode === 200) {
      await firestoreService.deletePhotoAlbum(albumId);
      res.send({ status: 'Album deleted' });
    } else {
      res.status(500).send({ status: 'Server error' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: 'Server error' });
  }
});

module.exports = router;
