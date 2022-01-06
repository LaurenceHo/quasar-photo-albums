const _ = require('lodash');
const express = require('express');
const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const helpers = require('./helpers');

// Reference:
// https://firebase.google.com/docs/reference/admin/node/firebase-admin.firestore
// https://googleapis.dev/nodejs/firestore/latest/Firestore.html

const router = express.Router();
router.get('/tags', async (req, res) => {
  const docRef = getFirestore().collection('album-tags');
  docRef
    .get()
    .then((querySnapshot) => {
      let i = 0;
      querySnapshot.forEach((doc) => {
        if (i === 0) {
          res.status(200).send(doc.data());
        }
        i++;
      });
    })
    .catch((error) => {
      console.log(error);
      return res.status(500).send({ status: 'Server error' });
    });
});

router.get('', async (req, res) => {
  const sessionCookie = req.cookies['__session'] || '';
  try {
    let decodedClaims = '';
    let userPermission = null;
    if (sessionCookie) {
      decodedClaims = await admin.auth().verifySessionCookie(sessionCookie, true);
      userPermission = await helpers.queryUserPermission(decodedClaims.uid);
    }
    const albumList = await _queryAlbums(_.get(userPermission, 'role') === 'admin');
    return res.status(200).send(albumList);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ status: 'Server error' });
  }
});

router.put('', helpers.verifyJwtClaim, async (req, res) => {
  if (req.user.role === 'admin') {
    const album = req.body;
    const writeBatch = getFirestore().batch();
    const albumRef = getFirestore().doc(`s3-photo-albums/${album.albumName}`);
    writeBatch.update(albumRef, album);
    writeBatch
      .commit()
      .then(() => {
        return res.status(200).send({ statue: 'Album updated' });
      })
      .catch((error) => {
        console.log(error);
        return res.status(500).send({ statue: 'Server error' });
      });
  } else {
    return res.status(403).send({ status: 'Unauthorized', message: `User ${req.user.email} doesn't have permission` });
  }
});

router.delete('/:albumName', helpers.verifyJwtClaim, async (req, res) => {
  if (req.user.role === 'admin') {
    const albumName = req.params.albumName;
    const writeBatch = getFirestore().batch();
    const albumRef = getFirestore().doc(`s3-photo-albums/${albumName}`);
    writeBatch.delete(albumRef);
    writeBatch
      .commit()
      .then(() => {
        return res.status(200).send({ statue: 'Album deleted' });
      })
      .catch((error) => {
        console.log(error);
        return res.status(500).send({ statue: 'Server error' });
      });
  } else {
    return res.status(403).send({ status: 'Unauthorized', message: `User ${req.user.email} doesn't have permission` });
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
    albumList.push(doc.data());
  });
  return albumList;
};

module.exports = router;
