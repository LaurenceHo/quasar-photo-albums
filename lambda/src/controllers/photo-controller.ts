import { Request, RequestHandler, Response } from 'express';
import jwt from 'jsonwebtoken';
import { get, isEmpty } from 'radash';
import { Photo, PhotosRequest, RenamePhotoRequest, UserPermission } from '../models';
import { cleanCookie } from '../route/auth-middleware';
import AlbumService from '../services/album-service';
import { S3Service } from '../services/s3-service';
import { asyncHandler } from '../utils/async-handler';
import JsonResponse from '../utils/json-response';
import { BaseController } from './base-controller';
import { deleteObjects, updatePhotoAlbum, uploadObject } from './helpers';

const s3Service = new S3Service();
const albumService = new AlbumService();
const bucketName = process.env.AWS_S3_BUCKET_NAME;

export default class PhotoController extends BaseController {
  /**
   * Get all photos from an album
   */
  findAll: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const albumId = req.params['albumId'];

    try {
      const album = await albumService.findOne({ id: albumId });
      if (album.isPrivate) {
        const token = get(req, 'cookies.jwt', null);
        if (token) {
          try {
            jwt.verify(token, process.env.JWT_SECRET as string, async (err: any, payload: any) => {
              if (err) {
                cleanCookie(res, 'Authentication failed. Please login.');
              }

              const user: UserPermission = payload;
              if (user?.role !== 'admin') {
                return new JsonResponse(403).unauthorized(res, 'Unauthorized action');
              }
              return;
            });
          } catch (error) {
            cleanCookie(res, 'Authentication failed. Please login.');
          }
        } else {
          return new JsonResponse(403).unauthorized(res, 'No auth token provided. Please login.');
        }
      }
      const folderNameKey = decodeURIComponent(albumId) + '/';
      const photos = await s3Service.findPhotosByAlbumId({
        Prefix: folderNameKey,
        Bucket: bucketName,
        MaxKeys: 1000,
        StartAfter: folderNameKey,
      });
      if (!isEmpty(photos)) {
        if (isEmpty(album.albumCover)) {
          await updatePhotoAlbum({
            ...album,
            albumCover: photos[0].key,
            updatedBy: 'System',
            updatedAt: new Date().toISOString(),
          });
        }
      } else {
        // Remove album cover photo
        if (!isEmpty(album.albumCover)) {
          await updatePhotoAlbum({
            ...album,
            albumCover: '',
            updatedBy: 'System',
            updatedAt: new Date().toISOString(),
          });
        }
      }
      return this.ok<Photo[]>(res, 'ok', photos);
    } catch (err: any) {
      console.error('Failed to get photos:', err);
      return this.fail(res, 'Failed to get photos');
    }
  });

  create: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const albumId = req.params['albumId'];

    try {
      const filename = req.file?.originalname;
      const buffer = req.file?.buffer;
      console.log(`##### Uploading file: ${filename}, mimeType: ${req.file?.mimetype}, file size: ${req.file?.size}`);
      const result = await uploadObject(`${albumId}/${filename}`, buffer);
      if (result) {
        console.log(`##### Photo uploaded: ${filename}`);
        return this.ok(res, 'Photo uploaded');
      }
      return this.fail(res, 'Failed to upload photos');
    } catch (err: any) {
      console.error('Failed to upload photos:', err);
      return this.fail(res, 'Failed to upload photos');
    }
  });

  /**
   * Move photos to another album
   */
  update: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { destinationAlbumId, albumId, photoKeys } = req.body as PhotosRequest;

    if (isEmpty(albumId)) {
      return this.clientError(res, 'No album');
    }

    if (isEmpty(destinationAlbumId)) {
      return this.clientError(res, 'No destination album');
    }

    if (!isEmpty(photoKeys)) {
      const promises: Promise<any>[] = [];
      photoKeys.forEach((photoKey) => {
        const sourcePhotoKey = `${albumId}/${photoKey}`;

        const promise = new Promise((resolve, reject) => {
          s3Service
            .copy({
              Bucket: process.env.AWS_S3_BUCKET_NAME,
              CopySource: `/${bucketName}/${sourcePhotoKey}`,
              Key: `${destinationAlbumId}/${photoKey}`,
            })
            .then((result) => {
              if (result) {
                deleteObjects([sourcePhotoKey])
                  .then((result) => {
                    if (result) {
                      console.log('##### Photo moved:', sourcePhotoKey);
                      resolve('Photo moved');
                    } else {
                      reject('Failed to delete photo');
                    }
                  })
                  .catch((err: Error) => {
                    reject(err);
                  });
              }
            })
            .catch((err: Error) => {
              reject(err);
            });
        });

        promises.push(promise);
      });

      try {
        await Promise.all(promises);
        return this.ok(res, 'Photo moved');
      } catch (err: any) {
        console.error('Failed to move photos:', err);
        return this.fail(res, 'Failed to move photos');
      }
    }
    return this.clientError(res, 'No photo needs to be moved');
  });

  rename: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { albumId, newPhotoKey, currentPhotoKey } = req.body as RenamePhotoRequest;

    if (isEmpty(albumId)) {
      return this.clientError(res, 'No album');
    }

    if (!isEmpty(newPhotoKey) && !isEmpty(currentPhotoKey)) {
      // Currently, the only way to rename an object using the SDK is to copy the object with a different name and
      // then delete the original object.
      try {
        const result = await s3Service.copy({
          Bucket: bucketName,
          CopySource: `/${bucketName}/${albumId}/${currentPhotoKey}`,
          Key: `${albumId}/${newPhotoKey}`,
        });
        if (result) {
          await deleteObjects([`${albumId}/${currentPhotoKey}`]);
          return this.ok(res, 'Photo renamed');
        }
        return this.fail(res, 'Failed to rename photo');
      } catch (err: any) {
        console.error('Failed to rename photo:', err);
        return this.fail(res, 'Failed to rename photo');
      }
    }
    return this.clientError(res, 'No photo needs to be renamed');
  });

  delete: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { albumId, photoKeys } = req.body as PhotosRequest;

    if (isEmpty(albumId)) {
      return this.clientError(res, 'No album');
    }

    if (!isEmpty(photoKeys)) {
      const photoKeysArray = photoKeys.map((photoKey) => `${albumId}/${photoKey}`);
      try {
        const result = await deleteObjects(photoKeysArray);
        if (result) {
          return this.ok(res, 'Photo deleted');
        }
        return this.fail(res, 'Failed to delete photos');
      } catch (err: any) {
        console.error('Failed to delete photos:', err);
        return this.fail(res, 'Failed to delete photos');
      }
    }
    return this.clientError(res, 'No photo needs to be deleted');
  });

  findOne: RequestHandler = asyncHandler(async () => {
    throw new Error('Method not implemented.');
  });
}
