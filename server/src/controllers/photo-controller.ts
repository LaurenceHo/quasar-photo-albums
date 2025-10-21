import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { FastifyReply, FastifyRequest, RouteHandler } from 'fastify';
import jwt from 'jsonwebtoken';
import { get, isEmpty } from 'radash';
import { cleanJwtCookie } from '../routes/auth-middleware.js';
import AlbumService from '../services/album-service.js';
import S3Service from '../services/s3-service.js';
import { PhotoResponse, PhotosRequest, RenamePhotoRequest } from '../types';
import { BaseController } from './base-controller.js';
import { deleteObjects, updatePhotoAlbum } from './helpers.js';

const s3Service = new S3Service();
const albumService = new AlbumService();

const bucketName = process.env['AWS_S3_BUCKET_NAME'];
const s3Client = new S3Client({ region: 'us-east-1' });

export default class PhotoController extends BaseController {
  /**
   * Get all photos from an album
   */
  findAll: RouteHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const year = (request.params as any)['year'] as string;
    const albumId = (request.params as any)['albumId'] as string;

    try {
      const album = await albumService.findOne({ id: albumId, year }, [
        'year',
        'id',
        'albumName',
        'albumCover',
        'description',
        'tags',
        'isPrivate',
        'place',
        'isFeatured',
      ]);
      // Only fetch photos when album exists
      if (!isEmpty(album)) {
        // If album is private, check if user has the admin permission
        if (album.isPrivate) {
          const token = get(request, 'cookies.jwt', '');
          const result = reply.unsignCookie(token);
          if (result.valid && result.value != null) {
            try {
              const decodedPayload = jwt.verify(result.value, process.env['JWT_SECRET'] as string);
              const isAdmin = get(decodedPayload, 'role') === 'admin';
              if (!isAdmin) {
                return cleanJwtCookie(reply, 'Unauthorized action.', 403);
              }
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error) {
              return cleanJwtCookie(reply, 'Authentication failed.');
            }
          } else {
            return cleanJwtCookie(reply, 'Authentication failed.');
          }
        }
        const folderNameKey = decodeURIComponent(albumId) + '/';
        const photos = await s3Service.findAll({
          Prefix: folderNameKey,
          Bucket: bucketName,
          MaxKeys: 1000,
          StartAfter: folderNameKey,
        });

        // If photo list is not empty and doesn't have album cover, set album cover
        if (!isEmpty(photos) && isEmpty(album.albumCover)) {
          await updatePhotoAlbum({
            ...album,
            albumCover: photos[0]?.key || '',
            updatedBy: 'System',
            updatedAt: new Date().toISOString(),
          });
          // Remove album cover photo when photo list is empty
        } else if (isEmpty(photos) && !isEmpty(album.albumCover)) {
          await updatePhotoAlbum({
            ...album,
            albumCover: '',
            updatedBy: 'System',
            updatedAt: new Date().toISOString(),
          });
        }
        return this.ok<PhotoResponse>(reply, 'ok', { album, photos });
      }
      return this.notFoundError(reply, 'Album does not exist');
    } catch (err: any) {
      request.log.error('Failed to get photos:', err);
      return this.fail(reply, 'Failed to get photos');
    }
  };

  create: RouteHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const albumId = (request.params as any)['albumId'] as string;
    const { filename, mimeType } = request.query as { filename: string; mimeType: string };

    if (!filename || !mimeType) {
      return this.fail(reply, 'Filename and mimeType are required in query parameters');
    }

    const filePath = `${albumId}/${filename}`;

    try {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: filePath,
        ContentType: mimeType,
      });

      // Generate presigned URL (valid for 60 seconds)
      const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });

      request.log.info(`##### Generated presigned URL for file: ${filePath}`);
      return this.ok(reply, 'ok', { uploadUrl });
    } catch (err: any) {
      request.log.error('Failed to generate presigned URL:', err);
      return this.fail(reply, 'Failed to generate upload URL');
    }
  };

  /**
   * Move photos to another album
   */
  update: RouteHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const { destinationAlbumId, albumId, photoKeys } = request.body as PhotosRequest;

    const promises: Promise<any>[] = [];
    photoKeys.forEach((photoKey) => {
      const sourcePhotoKey = `${albumId}/${photoKey}`;

      const promise = new Promise((resolve, reject) => {
        s3Service
          .copy({
            Bucket: process.env['AWS_S3_BUCKET_NAME'],
            CopySource: `/${bucketName}/${sourcePhotoKey}`,
            Key: `${destinationAlbumId}/${photoKey}`,
          })
          .then((result) => {
            if (result) {
              deleteObjects([sourcePhotoKey])
                .then((result) => {
                  if (result) {
                    request.log.info(`##### Photo moved: ${sourcePhotoKey}`);
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
      request.log.error('Failed to move photos:', err);
      return this.fail(reply, 'Failed to move photos');
    }
  };

  rename: RouteHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const { albumId, newPhotoKey, currentPhotoKey } = request.body as RenamePhotoRequest;

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
      request.log.error('Failed to rename photo:', err);
      return this.fail(reply, 'Failed to rename photo');
    }
  };

  delete: RouteHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const { albumId, photoKeys } = request.body as PhotosRequest;

    const photoKeysArray = photoKeys.map((photoKey) => `${albumId}/${photoKey}`);
    try {
      const result = await deleteObjects(photoKeysArray);
      if (result) {
        return this.ok(reply, 'Photo deleted');
      }
      return this.fail(reply, 'Failed to delete photos');
    } catch (err: any) {
      request.log.error('Failed to delete photos:', err);
      return this.fail(reply, 'Failed to delete photos');
    }
  };

  findOne: RouteHandler = async () => {
    throw new Error('Method not implemented.');
  };
}
