import { FastifyReply, FastifyRequest, RouteHandler } from 'fastify';
import jwt from 'jsonwebtoken';
import { get, isEmpty } from 'radash';
import { Photo, PhotosRequest, RenamePhotoRequest } from '../models.js';
import { cleanCookie } from '../routes/auth-middleware.js';
import { UserPermission } from '../schemas/user-permission.js';
import AlbumService from '../services/album-service.js';
import { S3Service } from '../services/s3-service.js';
import { asyncHandler } from '../utils/async-handler.js';
import JsonResponse from '../utils/json-response.js';
import { BaseController } from './base-controller.js';
import { deleteObjects, updatePhotoAlbum, uploadObject } from './helpers.js';

const s3Service = new S3Service();
const albumService = new AlbumService();
const bucketName = process.env.AWS_S3_BUCKET_NAME;

export default class PhotoController extends BaseController {
  /**
   * Get all photos from an album
   */
  findAll: RouteHandler = asyncHandler(async (request: FastifyRequest, reply: FastifyReply) => {
    const albumId = (request.params as any)['albumId'] as string;

    try {
      const album = await albumService.findOne({ id: albumId });
      if (!isEmpty(album)) {
        if (album.isPrivate) {
          const token = get(request, 'cookies.jwt', '');
          const result = reply.unsignCookie(token);
          if (result.valid && result.value != null) {
            try {
              jwt.verify(result.value, process.env.JWT_SECRET as string, async (err: any, payload: any) => {
                if (err) {
                  cleanCookie(reply, 'Authentication failed. Please login.');
                }

                const user: UserPermission = payload;
                if (user?.role !== 'admin') {
                  return new JsonResponse(403).unauthorized(reply, 'Unauthorized action');
                }
                return;
              });
            } catch (error) {
              cleanCookie(reply, 'Authentication failed. Please login.');
            }
          } else {
            return new JsonResponse(403).unauthorized(reply, 'No auth token provided. Please login.');
          }
        }
        const folderNameKey = decodeURIComponent(albumId) + '/';
        const photos = await s3Service.findAll({
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
        return this.ok<Photo[]>(reply, 'ok', photos);
      }
      return this.fail(reply, 'Album not found');
    } catch (err: any) {
      console.error('Failed to get photos:', err);
      return this.fail(reply, 'Failed to get photos');
    }
  });

  create: RouteHandler = asyncHandler(async (request: FastifyRequest, reply: FastifyReply) => {
    const albumId = (request.params as any)['albumId'] as string;

    try {
      const data = await request.file();
      const filename = data?.filename;
      const mimeType = data?.mimetype;
      const buffer = await data?.toBuffer();
      console.log(`##### Uploading file: ${filename}, mimeType: ${mimeType}, file size: ${buffer?.length}`);
      const result = await uploadObject(`${albumId}/${filename}`, buffer);
      if (result) {
        console.log(`##### Photo uploaded: ${filename}`);
        return this.ok(reply, 'Photo uploaded');
      }
      return this.fail(reply, 'Failed to upload photos');
    } catch (err: any) {
      console.error('Failed to upload photos:', err);
      return this.fail(reply, 'Failed to upload photos');
    }
  });

  /**
   * Move photos to another album
   */
  update: RouteHandler = asyncHandler(async (request: FastifyRequest, reply: FastifyReply) => {
    const { destinationAlbumId, albumId, photoKeys } = request.body as PhotosRequest;

    if (isEmpty(albumId)) {
      return this.clientError(reply, 'No album');
    }

    if (isEmpty(destinationAlbumId)) {
      return this.clientError(reply, 'No destination album');
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
        return this.ok(reply, 'Photo moved');
      } catch (err: any) {
        console.error('Failed to move photos:', err);
        return this.fail(reply, 'Failed to move photos');
      }
    }
    return this.clientError(reply, 'No photo needs to be moved');
  });

  rename: RouteHandler = asyncHandler(async (request: FastifyRequest, reply: FastifyReply) => {
    const { albumId, newPhotoKey, currentPhotoKey } = request.body as RenamePhotoRequest;

    if (isEmpty(albumId)) {
      return this.clientError(reply, 'No album');
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
          return this.ok(reply, 'Photo renamed');
        }
        return this.fail(reply, 'Failed to rename photo');
      } catch (err: any) {
        console.error('Failed to rename photo:', err);
        return this.fail(reply, 'Failed to rename photo');
      }
    }
    return this.clientError(reply, 'No photo needs to be renamed');
  });

  delete: RouteHandler = asyncHandler(async (request: FastifyRequest, reply: FastifyReply) => {
    const { albumId, photoKeys } = request.body as PhotosRequest;

    if (isEmpty(albumId)) {
      return this.clientError(reply, 'No album');
    }

    if (!isEmpty(photoKeys)) {
      const photoKeysArray = photoKeys.map((photoKey) => `${albumId}/${photoKey}`);
      try {
        const result = await deleteObjects(photoKeysArray);
        if (result) {
          return this.ok(reply, 'Photo deleted');
        }
        return this.fail(reply, 'Failed to delete photos');
      } catch (err: any) {
        console.error('Failed to delete photos:', err);
        return this.fail(reply, 'Failed to delete photos');
      }
    }
    return this.clientError(reply, 'No photo needs to be deleted');
  });

  findOne: RouteHandler = asyncHandler(async () => {
    throw new Error('Method not implemented.');
  });
}
