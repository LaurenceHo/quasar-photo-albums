import { isEmpty, isUndefined } from 'lodash';
import { Photo, PhotosRequest } from '../models';
import AlbumService from '../services/album-service';
import { S3Service } from '../services/s3-service';
import { BaseController } from './base-controller';
import { deleteObjects, updatePhotoAlbum, uploadObject } from './helpers';
import { Request, RequestHandler, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';

const s3Service = new S3Service();
const albumService = new AlbumService();
const bucketName = process.env.AWS_S3_BUCKET_NAME;
const albumTableName = process.env.PHOTO_ALBUMS_TABLE_NAME;

export default class PhotoController extends BaseController {
  /**
   * Get all photos in an album
   */
  findAll = asyncHandler(async (req: Request, res: Response) => {
    const albumId = req.params['albumId'];

    try {
      const album = await albumService.findOne({
        TableName: albumTableName,
        Key: {
          id: albumId,
        },
      });
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

  create = asyncHandler(async (req: Request, res: Response) => {
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
  update = asyncHandler(async (req: Request, res: Response) => {
    const photos = req.body as PhotosRequest;
    const { destinationAlbumId, albumId, photoKeys } = photos;
    if (isUndefined(destinationAlbumId) || isEmpty(destinationAlbumId)) {
      return this.clientError(res, 'No destination album');
    }

    if (!isUndefined(photoKeys) && !isEmpty(photoKeys)) {
      const promises: Promise<any>[] = [];
      photoKeys.forEach((photoKey) => {
        const sourcePhotoKey = `${albumId}/${photoKey}`;

        const promise = new Promise((resolve, reject) =>
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
            })
        );

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

  delete = asyncHandler(async (req: Request, res: Response) => {
    const photosRequest = req.body as PhotosRequest;
    const { albumId, photoKeys } = photosRequest;

    if (!isUndefined(photoKeys) && !isEmpty(photoKeys)) {
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

  findOne: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    throw new Error('Method not implemented.');
  });
}
