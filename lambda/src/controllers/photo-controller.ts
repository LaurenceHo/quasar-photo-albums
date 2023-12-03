import { isEmpty, isUndefined } from 'lodash';
import { STATUS_ERROR, STATUS_SUCCESS } from '../constants';
import { BaseController, PhotosRequest } from '../models';
import AlbumService from '../services/album-service';
import { S3Service } from '../services/s3-service';
import { deleteObjects, updatePhotoAlbum, uploadObject } from './helpers';
import { Request, Response } from 'express';

const s3Service = new S3Service();
const albumService = new AlbumService();
const bucketName = process.env.AWS_S3_BUCKET_NAME;
const albumTableName = process.env.PHOTO_ALBUMS_TABLE_NAME;

export default class PhotoController implements BaseController {
  async findPhotosByAlbumId(req: Request, res: Response): Promise<void> {
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
      res.send(photos);
    } catch (err: any) {
      console.error(err);
      res.status(500).send({ status: STATUS_ERROR, message: 'Error when copying photo' });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    const albumId = req.params['albumId'];

    try {
      const filename = req.file?.originalname;
      const buffer = req.file?.buffer;
      console.log(`##### Uploading file: ${filename}, mimeType: ${req.file?.mimetype}, file size: ${req.file?.size}`);
      const result = await uploadObject(`${albumId}/${filename}`, buffer);
      if (result) {
        res.send({ status: STATUS_SUCCESS });
        console.log(`##### File uploaded: ${filename}`);
      }
    } catch (err: any) {
      console.error(err);
      res.status(500).send({ status: STATUS_ERROR, message: 'Error when uploading photo' });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    const photos = req.body as PhotosRequest;
    const { destinationAlbumId, albumId, photoKeys } = photos;
    if (isUndefined(destinationAlbumId) || isEmpty(destinationAlbumId)) {
      res.status(400).send({ status: STATUS_ERROR, message: 'No destination album' });
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
                    console.error(err);
                    reject(err);
                    res.status(500).send({ status: STATUS_ERROR, message: err.message });
                  });
              }
            })
            .catch((err: Error) => {
              console.error(err);
              reject(err);
              res.status(500).send({ status: STATUS_ERROR, message: err.message });
            })
        );

        promises.push(promise);
      });

      try {
        await Promise.all(promises);
        res.send({ status: STATUS_SUCCESS, message: 'Photo moved' });
      } catch (err: any) {
        console.error(err);
        res.status(500).send({
          status: STATUS_ERROR,
          message: err.message,
        });
      }
    } else {
      res.status(400).send({ status: STATUS_ERROR, message: 'No photo needs to be moved' });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    const photosRequest = req.body as PhotosRequest;
    const { albumId, photoKeys } = photosRequest;

    if (!isUndefined(photoKeys) && !isEmpty(photoKeys)) {
      const photoKeysArray = photoKeys.map((photoKey) => `${albumId}/${photoKey}`);
      deleteObjects(photoKeysArray)
        .then((result) => {
          if (result) {
            res.send({ status: STATUS_SUCCESS, message: 'Photo deleted' });
          }
        })
        .catch((err: Error) => {
          console.error(err);
          res.status(500).send({ status: STATUS_ERROR, message: err.message });
        });
    } else {
      res.status(400).send({ status: STATUS_ERROR, message: 'No photo needs to be deleted' });
    }
  }
}
