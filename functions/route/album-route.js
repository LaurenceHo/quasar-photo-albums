const _ = require('lodash');
const express = require('express');
const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const helpers = require('../helpers');

// Reference:
// https://firebase.google.com/docs/reference/admin/node/firebase-admin.firestore
// https://googleapis.dev/nodejs/firestore/latest/Firestore.html

const router = express.Router();

router.get('', async (req, res) => {
  const sessionCookie = req.cookies['__session'] || '';
  try {
    let decodedClaims = '';
    let userPermission = null;
    if (sessionCookie) {
      decodedClaims = await admin.auth().verifySessionCookie(sessionCookie, true);
      userPermission = await helpers.queryUserPermission(decodedClaims.uid);
    }
    const isAdmin = _.get(userPermission, 'role') === 'admin';
    if (!isAdmin) {
      res.set('Cache-control', 'public, max-age=3600');
    }
    const albumList = await _queryAlbums(isAdmin);
    helpers.setupDefaultAlbumCover(albumList); // Do it in the background
    res.send(albumList);
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: 'Server error' });
  }
});

router.post('', helpers.verifyJwtClaim, async (req, res) => {
  if (req.user.role === 'admin') {
    const album = req.body;
    // Because we don't want to use auto generated id, we need to use "set" to create document
    // https://googleapis.dev/nodejs/firestore/latest/DocumentReference.html#set
    const albumRef = getFirestore().collection('s3-photo-albums').doc(album.id);

    delete album.id;

    albumRef
      .set(album)
      .then(() => res.send({ statue: 'Album created' }))
      .catch((error) => {
        console.log(`Failed to create document: ${error}`);
        res.status(500).send({ statue: 'Server error' });
      });
  } else {
    res.status(403).send({ status: 'Unauthorized', message: `User ${req.user.email} doesn't have permission` });
  }
});

router.put('', helpers.verifyJwtClaim, async (req, res) => {
  if (req.user.role === 'admin') {
    const album = req.body;
    const albumRef = getFirestore().doc(`s3-photo-albums/${album.id}`);
    albumRef
      .update(album)
      .then(() => res.send({ statue: 'Album updated' }))
      .catch((error) => {
        console.log(error);
        res.status(500).send({ statue: 'Server error' });
      });
  } else {
    res.status(403).send({ status: 'Unauthorized', message: `User ${req.user.email} doesn't have permission` });
  }
});

router.delete('/:albumId', helpers.verifyJwtClaim, async (req, res) => {
  if (req.user.role === 'admin') {
    const albumId = req.params['albumId'];
    const albumRef = getFirestore().doc(`s3-photo-albums/${albumId}`);
    albumRef
      .delete()
      .then(() => res.send({ statue: 'Album deleted' }))
      .catch((error) => {
        console.log(error);
        res.status(500).send({ statue: 'Server error' });
      });
  } else {
    res.status(403).send({ status: 'Unauthorized', message: `User ${req.user.email} doesn't have permission` });
  }
});

const _queryAlbums = async (isAdmin) => {
  const albumList = [];
  const albumRef = getFirestore().collection('s3-photo-albums');
  let queryResult;
  if (isAdmin) {
    queryResult = await albumRef.orderBy('albumName', 'desc').get();
  } else {
    queryResult = await albumRef.where('private', '==', false).orderBy('albumName', 'desc').get();
  }
  queryResult.forEach((doc) => {
    albumList.push({ ...doc.data(), id: doc.id });
  });
  return albumList;
};

module.exports = router;
