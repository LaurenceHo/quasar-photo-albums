import { FastifyReply, FastifyRequest, RouteHandler } from 'fastify';
import AlbumTagService from '../d1/album-tag-service.js';
import { RequestWithUser } from '../types';
import { AlbumTag } from '../types/album.js';
import { BaseController } from './base-controller.js';
import { updateDatabaseAt } from './helpers.js';

export default class AlbumTagController extends BaseController {
  findAll: RouteHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const albumTagService = new AlbumTagService(request.env.DB);
    try {
      const albumTags = await albumTagService.getAll();

      return this.ok<AlbumTag[]>(reply, 'ok', albumTags);
    } catch (err: any) {
      request.log.error(`Failed to query album tags: ${err}`);
      return this.fail(reply, 'Failed to query album tags');
    }
  };

  create: RouteHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const tags: AlbumTag[] = request.body as AlbumTag[];
    const tagsToCreate: AlbumTag[] = tags.map((tag) => {
      return {
        ...tag,
        createdBy: (request as RequestWithUser).user?.email ?? 'unknown',
      };
    });
    const albumTagService = new AlbumTagService(request.env.DB);

    try {
      await albumTagService.create(tagsToCreate);

      await updateDatabaseAt('album');
      return this.ok(reply, 'Album tag created');
    } catch (err) {
      request.log.error(`Failed to create album tag: ${err}`);
      return this.fail(reply, 'Failed to create album tag');
    }
  };

  delete: RouteHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const tag = (request.params as any)['tagId'] as string;
    const albumTagService = new AlbumTagService(request.env.DB);
    try {
      request.log.info('##### Delete tag: %s', tag);
      await albumTagService.delete(tag);

      await updateDatabaseAt('album');
      return this.ok(reply, 'Album tag deleted');
    } catch (err) {
      request.log.error(`Failed to delete album tag: ${err}`);
      return this.fail(reply, 'Failed to delete album tag');
    }
  };

  findOne: RouteHandler = async () => {
    throw new Error('Method not implemented.');
  };

  update: RouteHandler = async () => {
    throw new Error('Method not implemented.');
  };
}
