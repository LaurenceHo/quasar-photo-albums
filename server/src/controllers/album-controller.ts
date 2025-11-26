import { FastifyReply, FastifyRequest, RouteHandler } from 'fastify';
import { RequestWithUser } from '../types';
import { Album } from '../types/album';
import { BaseController } from './base-controller.js';
import {
  emptyS3Folder,
  updateDatabaseAt,
  uploadObject,
  verifyIfIsAdmin,
} from './helpers.js';
import { D1Client } from '../d1/d1-client.js';

const albumClient = new D1Client('albums', ['place']);

export default class AlbumController extends BaseController {
  findAll: RouteHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const year = (request.params as any)['year'] as string;

    try {
      const isAdmin = verifyIfIsAdmin(request, reply);

      const query: any = { year };
      if (!isAdmin) {
        query.isPrivate = false;
      }

      const albumList = await albumClient.find<Album>(query);

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

    try {
      // Check if album already exists
      try {
        await albumClient.getById(album.id);
        return this.clientError(reply, 'Album already exists');
      } catch (e: any) {
        // If 404, it means it doesn't exist, which is what we want.
        // D1Client throws "D1 Worker error 404: ..."
        if (!e.message.includes('404')) {
          throw e;
        }
      }

      await albumClient.create(album);

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

      await albumClient.update(album.id, album);
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
      // Empty S3 folder
      const result = await emptyS3Folder(requestBody.id);

      if (result) {
        // Delete album from database
        await albumClient.delete(requestBody.id);
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

    try {
      const album = await albumClient.getById<Album>(albumId);
      return this.ok<Album>(reply, 'ok', album);
    } catch (err: any) {
      if (err.message.includes('404')) {
        return this.clientError(reply, 'Album not found');
      }
      request.log.error(`Failed to query photo album: ${err}`);
      return this.fail(reply, 'Failed to query photo album');
    }
  };
}
