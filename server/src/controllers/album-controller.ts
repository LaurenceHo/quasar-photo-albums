import { FastifyReply, FastifyRequest, RouteHandler } from 'fastify';
import AlbumService from '../d1/album-service.js';
import { RequestWithUser } from '../types';
import { Album } from '../types/album';
import { BaseController } from './base-controller.js';
import { emptyS3Folder, updateDatabaseAt, uploadObject, verifyIfIsAdmin } from './helpers.js';

export default class AlbumController extends BaseController {
  findAll: RouteHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const year = (request.params as any)['year'] as string;
    const albumService = new AlbumService(request.env.DB);

    try {
      const isAdmin = verifyIfIsAdmin(request, reply);

      const query: any = { year };
      if (!isAdmin) {
        query.isPrivate = 0;
      }

      const albumList = await albumService.getAll(query);

      return this.ok<Album[]>(reply, 'ok', albumList);
    } catch (err: any) {
      request.log.error(`Failed to query photo album: ${err}`);
      return this.fail(reply, 'Failed to query photo album');
    }
  };

  create: RouteHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const album = request.body as Album;
    album.createdBy = (request as RequestWithUser).user?.email ?? 'unknown';
    album.updatedBy = (request as RequestWithUser).user?.email ?? 'unknown';
    const albumService = new AlbumService(request.env.DB);

    try {
      // Check if album already exists
      const existing = await albumService.getById(album.id);
      if (existing) {
        return this.clientError(reply, 'Album already exists');
      }

      await albumService.create(album);

      await updateDatabaseAt('album');
      // Create folder in S3
      await uploadObject(album.id + '/', null);
      return this.ok(reply, 'Album created');
    } catch (err: any) {
      request.log.error(`Failed to insert photo album: ${err}`);
      return this.fail(reply, 'Failed to create photo album');
    }
  };

  update: RouteHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const album = request.body as Album;
      album.updatedBy = (request as RequestWithUser).user?.email ?? 'unknown';
      const albumService = new AlbumService(request.env.DB);

      await albumService.update(album.id, album);
      await updateDatabaseAt('album');

      return this.ok(reply, 'Album updated');
    } catch (err: any) {
      request.log.error(`Failed to update photo album: ${err}`);
      return this.fail(reply, 'Failed to update photo album');
    }
  };

  delete: RouteHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const requestBody = request.body as { id: string; year: string };
      request.log.info('##### Delete album: %s', requestBody.id);
      const albumService = new AlbumService(request.env.DB);

      // Empty S3 folder
      const result = await emptyS3Folder(requestBody.id);

      if (result) {
        // Delete album from database
        await albumService.delete(requestBody.id);
        await updateDatabaseAt('album');
        return this.ok(reply, 'Album deleted');
      } else {
        return this.fail(reply, 'Failed to delete photo album');
      }
    } catch (err: any) {
      request.log.error(`Failed to delete photo album: ${err}`);
      return this.fail(reply, 'Failed to delete photo album');
    }
  };

  findOne: RouteHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const albumId = (request.params as any)['id'] as string;
    const albumService = new AlbumService(request.env.DB);

    try {
      const album = await albumService.getById(albumId);
      if (!album) {
        return this.clientError(reply, 'Album not found');
      }
      return this.ok<Album>(reply, 'ok', album);
    } catch (err: any) {
      request.log.error(`Failed to query photo album: ${err}`);
      return this.fail(reply, 'Failed to query photo album');
    }
  };
}
