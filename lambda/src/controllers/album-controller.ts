import { Request, RequestHandler, Response } from 'express';
import admin from 'firebase-admin';
import get from 'lodash/get';
import { Album, RequestWithUser } from '../models';
import AlbumService from '../services/album-service';
import UserService from '../services/user-service';
import { asyncHandler } from '../utils/async-handler';
import { BaseController } from './base-controller';
import { emptyS3Folder, updatePhotoAlbum, uploadObject } from './helpers';

const userService = new UserService();
const albumService = new AlbumService();
const photoAlbumTableName = process.env.PHOTO_ALBUMS_TABLE_NAME;

export default class AlbumController extends BaseController {
  findAll: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    try {
      const firebaseToken = get(req, 'cookies.__session', '');
      let userPermission = null;
      if (firebaseToken) {
        // Reference:
        // https://firebase.google.com/docs/reference/admin/node/firebase-admin.firestore
        const { uid } = await admin.auth().verifySessionCookie(firebaseToken, true);
        userPermission = await userService.queryUserPermissionByUid(uid);
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

      return this.ok<Album[]>(res, 'ok', albumList);
    } catch (err: any) {
      console.error(`Failed to query photo album: ${err}`);
      return this.fail(res, 'Failed to query photo album');
    }
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const album = req.body as Album;
    album.createdBy = (req as RequestWithUser).user.email;
    album.createdAt = new Date().toISOString();
    album.updatedAt = new Date().toISOString();

    try {
      const result = await albumService.create({
        TableName: photoAlbumTableName,
        Item: album,
      });
      if (result) {
        await uploadObject('updateDatabaseAt.json', JSON.stringify({ time: new Date().toISOString() }));
        // Create folder in S3
        await uploadObject(album.id + '/', null);
        return this.ok(res, 'Album created');
      }
      return this.fail(res, 'Failed to create photo album');
    } catch (err: any) {
      console.error(`Failed to insert photo album: ${err}`);
      return this.fail(res, 'Failed to create photo album');
    }
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    try {
      const album: Album = req.body;
      album.updatedBy = (req as RequestWithUser).user.email;
      album.updatedAt = new Date().toISOString();

      const result = await updatePhotoAlbum(album);

      if (result) {
        return this.ok(res, 'Album updated');
      }
      return this.fail(res, 'Failed to update photo album');
    } catch (err: any) {
      return this.fail(res, 'Failed to update photo album');
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
          return this.ok(res, 'Album deleted');
        }
        return this.fail(res, 'Failed to delete photo album');
      } else {
        return this.fail(res, 'Failed to delete photo album');
      }
    } catch (err: any) {
      console.error(`Failed to delete photo album: ${err}`);
      return this.fail(res, 'Failed to delete photo album');
    }
  });

  findOne: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    throw new Error('Method not implemented.');
  });
}