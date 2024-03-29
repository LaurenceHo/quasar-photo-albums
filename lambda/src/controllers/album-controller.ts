import { Request, RequestHandler, Response } from 'express';
import jwt from 'jsonwebtoken';
import { get } from 'radash';
import { RequestWithUser } from '../models';
import { Album } from '../schemas/album';
import AlbumService from '../services/album-service';
import { asyncHandler } from '../utils/async-handler';
import { BaseController } from './base-controller';
import { emptyS3Folder, updatePhotoAlbum, uploadObject } from './helpers';

const albumService = new AlbumService();

export default class AlbumController extends BaseController {
  findAll: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    try {
      let isAdmin = false;
      const token = get(req, 'cookies.jwt', null);
      if (token) {
        jwt.verify(token, process.env.JWT_SECRET as string, (err: any, payload: any) => {
          if (err) {
            res.clearCookie('jwt');
          }
          isAdmin = get(payload, 'role') === 'admin';
        });
      }

      let query = null;
      if (!isAdmin) {
        query = ({ isPrivate }: any, { eq }: any) => `${eq(isPrivate, false)}`;
      }
      // TODO - Need to sort by order
      const albumList = await albumService.findAll(
        ['id', 'albumName', 'albumCover', 'description', 'tags', 'isPrivate', 'place', 'order'],
        query
      );

      return this.ok<Album[]>(res, 'ok', albumList);
    } catch (err: any) {
      console.error(`Failed to query photo album: ${err}`);
      return this.fail(res, 'Failed to query photo album');
    }
  });

  create: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const album = req.body as Album;
    album.createdBy = (req as RequestWithUser).user?.email ?? 'unknown';
    album.createdAt = new Date().toISOString();
    album.updatedBy = (req as RequestWithUser).user?.email ?? 'unknown';
    album.updatedAt = new Date().toISOString();

    try {
      const result = await albumService.create(album);
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

  update: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    try {
      const album: Album = req.body;
      album.updatedBy = (req as RequestWithUser).user?.email ?? 'unknown';
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

  delete: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const albumId = req.params.albumId;

    try {
      console.log('##### Delete album:', albumId);
      // Empty S3 folder
      const result = await emptyS3Folder(albumId);

      if (result) {
        // Delete album from database
        const result = await albumService.delete({ id: albumId });

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

  findOne: RequestHandler = asyncHandler(async () => {
    throw new Error('Method not implemented.');
  });
}
