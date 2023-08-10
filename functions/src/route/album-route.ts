import express from 'express';
import admin from 'firebase-admin';
import { info, error } from 'firebase-functions/logger';
import _ from 'lodash';
import { AlbumV2 } from '../models';
import {
  createPhotoAlbumV2,
  deletePhotoAlbumV2,
  queryPhotoAlbumsV2,
  queryUserPermissionV2,
  updatePhotoAlbumV2,
} from '../services/aws-dynamodb-service';
import { emptyS3Folder, uploadObject } from '../services/aws-s3-service';
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
      userPermission = await queryUserPermissionV2(decodedClaims?.uid);
    }

    const isAdmin = _.get(userPermission, 'role') === 'admin';
    if (!isAdmin) {
      res.set('Cache-control', 'public, max-age=3600');
    }
    const albumList = await queryPhotoAlbumsV2(isAdmin);
    res.send(albumList);
  } catch (err) {
    error(err);
    res.status(500).send({ status: 'Server error' });
  }
});

router.post('', verifyJwtClaim, verifyUserPermission, async (req, res) => {
  const album = req.body as AlbumV2;
  album.order = 0;
  // @ts-ignore
  album.createdBy = req.user.email;
  album.createdAt = new Date().toISOString();
  album.updatedAt = new Date().toISOString();

  try {
    await createPhotoAlbumV2(album);
    await uploadObject(album.id + '/', null);
    res.send({ status: 'Album created' });
  } catch (err) {
    error(err);
    res.status(500).send({ status: 'Server error' });
  }
});

router.put('', verifyJwtClaim, verifyUserPermission, async (req, res) => {
  const album = req.body as AlbumV2;
  // @ts-ignore
  album.updatedBy = req.user.email;
  album.updatedAt = new Date().toISOString();

  updatePhotoAlbumV2(album)
    .then(() => res.send({ status: 'Album updated' }))
    .catch((err: Error) => {
      error(err);
      res.status(500).send({ status: 'Server error' });
    });
});

router.delete('/:albumId', verifyJwtClaim, verifyUserPermission, async (req, res) => {
  const albumId = req.params.albumId;

  try {
    const result = await emptyS3Folder(albumId);
    info('###### Delete album:', albumId);
    info('###### Delete result:', result);
    // @ts-ignore
    if (result.$metadata.httpStatusCode === 200) {
      await deletePhotoAlbumV2(albumId);
      res.send({ status: 'Album deleted' });
    } else {
      res.status(500).send({ status: 'Server error' });
    }
  } catch (err) {
    error(err);
    res.status(500).send({ status: 'Server error' });
  }
});
