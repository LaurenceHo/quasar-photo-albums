import express from 'express';
import admin from 'firebase-admin';
import _ from 'lodash';
import { Album } from '../models';
import { emptyS3Folder, uploadObject } from '../services/aws-s3-service';
import {
  createPhotoAlbum,
  deletePhotoAlbum,
  queryPhotoAlbums,
  queryUserPermission,
  updatePhotoAlbum,
} from '../services/firestore-service';
import { verifyJwtClaim, verifyUserPermission } from './helpers';

// Reference:
// https://firebase.google.com/docs/reference/admin/node/firebase-admin.firestore
// https://googleapis.dev/nodejs/firestore/latest/Firestore.html

export const router = express.Router();

router.get('', async (req, res) => {
  try {
    const firebaseToken = _.get(req, 'cookies.__session', '');
    let decodedClaims = null;
    let userPermission = null;
    if (firebaseToken) {
      decodedClaims = await admin.auth().verifySessionCookie(firebaseToken, true);
      userPermission = await queryUserPermission(decodedClaims?.uid);
    }

    const isAdmin = _.get(userPermission, 'role') === 'admin';
    if (!isAdmin) {
      res.set('Cache-control', 'public, max-age=3600');
    }
    const albumList = await queryPhotoAlbums(isAdmin);
    res.send(albumList);
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: 'Server error' });
  }
});

router.post('', verifyJwtClaim, verifyUserPermission, async (req, res) => {
  const album = req.body as Album;
  try {
    await uploadObject(album.id + '/', null);
    await createPhotoAlbum(album);
    res.send({ status: 'Album created' });
  } catch (error) {
    console.log(`Failed to create album folder: ${error}`);
    res.status(500).send({ status: 'Server error' });
  }
});

router.put('', verifyJwtClaim, verifyUserPermission, async (req, res) => {
  const album = req.body as Album;

  updatePhotoAlbum(album)
    .then(() => res.send({ status: 'Album updated' }))
    .catch((error: Error) => {
      console.log(error);
      res.status(500).send({ status: 'Server error' });
    });
});

router.delete('/:albumId', verifyJwtClaim, verifyUserPermission, async (req, res) => {
  const albumId = req.params.albumId;

  try {
    console.log('###### Delete album:', albumId);
    const result = await emptyS3Folder(albumId);
    console.log('###### Delete result:', result);
    // @ts-ignore
    if (result.$metadata.httpStatusCode === 200) {
      await deletePhotoAlbum(albumId);
      res.send({ status: 'Album deleted' });
    } else {
      res.status(500).send({ status: 'Server error' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: 'Server error' });
  }
});
