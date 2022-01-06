const _ = require('lodash');
const express = require('express');
const { getFirestore } = require('firebase-admin/firestore');
const admin = require('firebase-admin');
const router = express.Router();
const helpers = require('./helpers');

router.get('/albums/tags', async (req, res) => {
  const db = getFirestore();
  const docRef = db.collection('album-tags');
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

router.get('/albums', async (req, res) => {
  const sessionCookie = req.cookies.session || '';
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

const _queryAlbums = async (isAdmin) => {
  const albumList = [];
  const db = getFirestore();
  const albumRef = db.collection('s3-photo-albums');
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
