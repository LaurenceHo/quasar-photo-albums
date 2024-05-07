import { FastifyReply, FastifyRequest, RouteHandler } from 'fastify';
import jwt from 'jsonwebtoken';
import { get } from 'radash';
import { RequestWithUser } from '../models.js';
import { Album } from '../schemas/album.js';
import AlbumService from '../services/album-service.js';
import { BaseController } from './base-controller.js';
import { emptyS3Folder, updatePhotoAlbum, uploadObject } from './helpers.js';

const albumService = new AlbumService();

export default class AlbumController extends BaseController {
  findAll: RouteHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const year = (request.params as any)['year'] as string;

    try {
      let isAdmin = false;
      const token = get(request, 'cookies.jwt', '');
      const result = reply.unsignCookie(token);

      if (result.valid && result.value != null) {
        try {
          const decodedPayload = jwt.verify(result.value, process.env.JWT_SECRET as string);
          isAdmin = get(decodedPayload, 'role') === 'admin';
        } catch (error) {
          reply.setCookie('jwt', '', { maxAge: 0, path: '/' });
        }
      }

      let query = null;
      if (!isAdmin) {
        query = ({ isPrivate }: any, { eq }: any) => `${eq(isPrivate, false)}`;
      }
      // TODO - Need to sort by order
      const albumList = await albumService.findAll(
        'query',
        { indexName: 'byYear', key: { year: year === 'na' ? 'n/a' : year } },
        ['year', 'id', 'albumName', 'albumCover', 'description', 'tags', 'isPrivate', 'place', 'order'],
        query
      );

      return this.ok<Album[]>(reply, 'ok', albumList);
    } catch (err: any) {
      console.error(`Failed to query photo album: ${err}`);
      return this.fail(reply, 'Failed to query photo album');
    }
  };

  create: RouteHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const album = request.body as Album;
    album.createdBy = (request as RequestWithUser).user?.email ?? 'unknown';
    album.updatedBy = (request as RequestWithUser).user?.email ?? 'unknown';

    try {
      const result = await albumService.create(album);

      if (result) {
        await uploadObject('updateDatabaseAt.json', JSON.stringify({ time: new Date().toISOString() }));
        // Create folder in S3
        await uploadObject(album.id + '/', null);
        return this.ok(reply, 'Album created');
      }
      return this.fail(reply, 'Failed to create photo album');
    } catch (err: any) {
      console.error(`Failed to insert photo album: ${err}`);
      return this.fail(reply, 'Failed to create photo album');
    }
  };

  update: RouteHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const album = request.body as Album;
      album.updatedBy = (request as RequestWithUser).user?.email ?? 'unknown';
      album.updatedAt = new Date().toISOString();

      const result = await updatePhotoAlbum(album);

      if (result) {
        return this.ok(reply, 'Album updated');
      }
      return this.fail(reply, 'Failed to update photo album');
    } catch (err: any) {
      return this.fail(reply, 'Failed to update photo album');
    }
  };

  delete: RouteHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const requestBody = request.body as { id: string; year: string };
      console.log('##### Delete album:', requestBody.id);
      // Empty S3 folder
      const result = await emptyS3Folder(requestBody.id);

      if (result) {
        // Delete album from database
        const result = await albumService.delete(requestBody);

        if (result) {
          await uploadObject('updateDatabaseAt.json', JSON.stringify({ time: new Date().toISOString() }));
          return this.ok(reply, 'Album deleted');
        }
        return this.fail(reply, 'Failed to delete photo album');
      } else {
        return this.fail(reply, 'Failed to delete photo album');
      }
    } catch (err: any) {
      console.error(`Failed to delete photo album: ${err}`);
      return this.fail(reply, 'Failed to delete photo album');
    }
  };

  findOne: RouteHandler = async () => {
    throw new Error('Method not implemented.');
  };
}
