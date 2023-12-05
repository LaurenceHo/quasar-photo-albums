import { isEmpty, isUndefined } from 'lodash';
import { BaseController, PhotosRequest } from '../models';
import AlbumService from '../services/album-service';
import { S3Service } from '../services/s3-service';
import { deleteObjects, updatePhotoAlbum, uploadObject } from './helpers';
import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import JsonResponse from '../utils/json-response';

const s3Service = new S3Service();
const albumService = new AlbumService();
const bucketName = process.env.AWS_S3_BUCKET_NAME;
const albumTableName = process.env.PHOTO_ALBUMS_TABLE_NAME;

export default class PhotoController implements BaseController {
  findPhotosByAlbumId = asyncHandler(async (req: Request, res: Response) => {
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
      return new JsonResponse().success(res, '', photos);
    } catch (err: any) {
      console.error(err);
      return new JsonResponse(500).error(res, 'Failed to get photos');
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
        console.log(`##### File uploaded: ${filename}`);
        return new JsonResponse().success(res, '', null);
      }
      return new JsonResponse(500).error(res, 'Failed to upload photos');
    } catch (err: any) {
      console.error(err);
      return new JsonResponse(500).error(res, 'Failed to upload photos');
    }
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const photos = req.body as PhotosRequest;
    const { destinationAlbumId, albumId, photoKeys } = photos;
    if (isUndefined(destinationAlbumId) || isEmpty(destinationAlbumId)) {
      return new JsonResponse(400).error(res, 'No destination album');
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
        return new JsonResponse().success(res, 'Photos moved', null);
      } catch (err: any) {
        console.error(err);
        return new JsonResponse(500).error(res, 'Failed to move photo');
      }
    } else {
      return new JsonResponse(400).error(res, 'No photo needs to be moved');
    }
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const photosRequest = req.body as PhotosRequest;
    const { albumId, photoKeys } = photosRequest;

    if (!isUndefined(photoKeys) && !isEmpty(photoKeys)) {
      const photoKeysArray = photoKeys.map((photoKey) => `${albumId}/${photoKey}`);
      try {
        const result = await deleteObjects(photoKeysArray);
        if (result) {
          return new JsonResponse().success(res, 'Photo deleted', null);
        }
        return new JsonResponse(500).error(res, 'Failed to delete photo');
      } catch (err: any) {
        console.error(err);
        return new JsonResponse(500).error(res, 'Failed to delete photo');
      }
    } else {
      return new JsonResponse(400).error(res, 'No photo needs to be deleted');
    }
  });
}
