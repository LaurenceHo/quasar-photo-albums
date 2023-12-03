import admin from 'firebase-admin';
import get from 'lodash/get';
import { STATUS_ERROR } from '../constants';
import { Album, BaseController } from '../models';
import AlbumService from '../services/album-service';
import { queryUserPermissionV2 } from '../services/aws-dynamodb-service';
import { emptyS3Folder, updatePhotoAlbum, uploadObject } from './helpers';
import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import JsonResponse from '../utils/json-response';

const albumService = new AlbumService();
const photoAlbumTableName = process.env.PHOTO_ALBUMS_TABLE_NAME;

export default class AlbumController implements BaseController {
  findAll = asyncHandler(async (req: Request, res: Response) => {
    try {
      const firebaseToken = get(req, 'cookies.__session', '');
      let decodedClaims = null;
      let userPermission = null;
      if (firebaseToken) {
        // Reference:
        // https://firebase.google.com/docs/reference/admin/node/firebase-admin.firestore
        decodedClaims = await admin.auth().verifySessionCookie(firebaseToken, true);
        userPermission = await queryUserPermissionV2(decodedClaims?.uid);
      }

      const isAdmin = get(userPermission, 'role') === 'admin';

      let params = {
        TableName: photoAlbumTableName,
        IndexName: 'id-order-index',
        ProjectionExpression: 'id, albumName, albumCover, description, tags, isPrivate, #Order',
        ExpressionAttributeNames: { '#Order': 'order' },
        // TODO - Need to sort by order
      } as any;
      if (!isAdmin) {
        params = {
          ...params,
          ExpressionAttributeValues: {
            ':val': false,
          },
          FilterExpression: 'isPrivate = :val',
        };
      }
      const albumList = await albumService.findAll(params);

      return new JsonResponse().success(res, '', albumList);
    } catch (err: any) {
      console.error(`Failed to query photo album: ${err}`);
      return new JsonResponse(500).error(res, STATUS_ERROR, 'Failed to query photo album');
    }
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const album = req.body as Album;
    // @ts-ignore
    album.createdBy = req.user.email;
    album.createdAt = new Date().toISOString();
    album.updatedAt = new Date().toISOString();

    try {
      const result = await albumService.create({
        TableName: photoAlbumTableName,
        Item: album,
      });
      if (result) {
        await uploadObject('updateDatabaseAt.json', JSON.stringify({ time: new Date().toISOString() }));
      }
      await uploadObject(album.id + '/', null);
      return new JsonResponse().success(res, 'Album created', null);
    } catch (err: any) {
      console.error(`Failed to insert photo album: ${err}`);
      return new JsonResponse(500).error(res, STATUS_ERROR, 'Failed to create photo album');
    }
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    try {
      const album: Album = req.body;
      // @ts-ignore
      album.updatedBy = req.user.email;
      album.updatedAt = new Date().toISOString();

      const result = await updatePhotoAlbum(album);

      if (result) {
        return new JsonResponse().success(res, 'Album updated', null);
      }
      return new JsonResponse(500).error(res, STATUS_ERROR, 'Failed to update photo album');
    } catch (err: any) {
      return new JsonResponse(500).error(res, STATUS_ERROR, 'Failed to update photo album');
    }
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const albumId = req.params.albumId;

    try {
      console.log('##### Delete album:', albumId);
      // Empty S3 folder
      const result = await emptyS3Folder(albumId);

      if (result) {
        // Delete album from database
        const result = await albumService.delete({
          TableName: photoAlbumTableName,
          Key: {
            id: albumId,
          },
        });

        if (result) {
          await uploadObject('updateDatabaseAt.json', JSON.stringify({ time: new Date().toISOString() }));
          return new JsonResponse().success(res, 'Album deleted', null);
        }
        return new JsonResponse(500).error(res, STATUS_ERROR, 'Failed to delete photo album');
      } else {
        return new JsonResponse(500).error(res, STATUS_ERROR, 'Failed to delete photo album');
      }
    } catch (err: any) {
      console.error(`Failed to delete photo album: ${err}`);
      return new JsonResponse(500).error(res, STATUS_ERROR, 'Failed to delete photo album');
    }
  });
}
