import express from 'express';
import admin from 'firebase-admin';
import get from 'lodash/get';
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
import { STATUS_ERROR, STATUS_SUCCESS } from '../constants';

// Reference:
// https://firebase.google.com/docs/reference/admin/node/firebase-admin.firestore

export const router = express.Router();

router.get('', async (req, res) => {
  try {
    const firebaseToken = get(req, 'cookies.__session', '');
    let decodedClaims = null;
    let userPermission = null;
    if (firebaseToken) {
      decodedClaims = await admin.auth().verifySessionCookie(firebaseToken, true);
      userPermission = await queryUserPermissionV2(decodedClaims?.uid);
    }

    const isAdmin = get(userPermission, 'role') === 'admin';
    const albumList = await queryPhotoAlbumsV2(isAdmin);
    res.send(albumList);
  } catch (err: any) {
    console.error(err);
    res.status(500).send({ status: STATUS_ERROR, message: err.message });
  }
});

router.post('', verifyJwtClaim, verifyUserPermission, async (req, res) => {
  const album = req.body as AlbumV2;
  // @ts-ignore
  album.createdBy = req.user.email;
  album.createdAt = new Date().toISOString();
  album.updatedAt = new Date().toISOString();

  try {
    await createPhotoAlbumV2(album);
    await uploadObject(album.id + '/', null);
    res.send({ status: STATUS_SUCCESS, message: 'Album created' });
  } catch (err: any) {
    console.error(err);
    res.status(500).send({ status: STATUS_ERROR, message: err.message });
  }
});

router.put('', verifyJwtClaim, verifyUserPermission, (req, res) => {
  const album = req.body as AlbumV2;
  // @ts-ignore
  album.updatedBy = req.user.email;
  album.updatedAt = new Date().toISOString();

  updatePhotoAlbumV2(album)
    .then(() => res.send({ status: STATUS_SUCCESS, message: 'Album updated' }))
    .catch((err: Error) => {
      console.error(err);
      res.status(500).send({ status: STATUS_ERROR, message: err.message });
    });
});

router.delete('/:albumId', verifyJwtClaim, verifyUserPermission, async (req, res) => {
  const albumId = req.params.albumId;

  try {
    const result = await emptyS3Folder(albumId);
    console.log('###### Delete album:', albumId);

    if (result?.$metadata?.httpStatusCode === 200) {
      await deletePhotoAlbumV2(albumId);
      res.send({ status: STATUS_SUCCESS, message: 'Album deleted' });
    } else {
      res.status(500).send({ status: STATUS_ERROR, message: 'Failed to delete album' });
    }
  } catch (err: any) {
    console.error(err);
    res.status(500).send({ status: STATUS_ERROR, message: err.message });
  }
});
