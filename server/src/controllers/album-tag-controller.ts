import { FastifyReply, FastifyRequest, RouteHandler } from 'fastify';
import { AlbumTag } from '../schemas/album-tag.js';
import AlbumTagService from '../services/album-tag-service.js';
import { asyncHandlerV2 } from '../utils/async-handler.js';
import { BaseControllerV2 } from './base-controller.js';
import { uploadObject } from './helpers.js';

const albumTagService = new AlbumTagService();

export default class AlbumTagController extends BaseControllerV2 {
  findAll: RouteHandler = asyncHandlerV2(async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const albumTags = await albumTagService.findAll();

      return this.ok<AlbumTag[]>(reply, 'ok', albumTags);
    } catch (err: any) {
      console.error(`Failed to query album tags: ${err}`);
      return this.fail(reply, 'Failed to query album tags');
    }
  });

  create: RouteHandler = asyncHandlerV2(async (request: FastifyRequest, reply: FastifyReply) => {
    const tag: AlbumTag = request.body as AlbumTag;
    try {
      const result = await albumTagService.create(tag);

      if (result) {
        await uploadObject('updateDatabaseAt.json', JSON.stringify({ time: new Date().toISOString() }));
        return this.ok(reply, 'Album tag created');
      }
      return this.fail(reply, 'Failed to create album tag');
    } catch (err) {
      console.error(`Failed to create album tag: ${err}`);
      return this.fail(reply, 'Failed to create album tag');
    }
  });

  delete: RouteHandler = asyncHandlerV2(async (request: FastifyRequest, reply: FastifyReply) => {
    const tag = (request.params as any)['tagId'] as string;
    try {
      const result = await albumTagService.delete({ tag });
      if (result) {
        await uploadObject('updateDatabaseAt.json', JSON.stringify({ time: new Date().toISOString() }));
        return this.ok(reply, 'Album tag deleted');
      }
      return this.fail(reply, 'Failed to delete album tag');
    } catch (err) {
      console.error(`Failed to delete album tag: ${err}`);
      return this.fail(reply, 'Failed to delete album tag');
    }
  });

  findOne: RouteHandler = asyncHandlerV2(async () => {
    throw new Error('Method not implemented.');
  });

  update: RouteHandler = asyncHandlerV2(async () => {
    throw new Error('Method not implemented.');
  });
}
