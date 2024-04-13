import { FastifyReply, FastifyRequest, RouteHandler } from 'fastify';
import { AlbumTag } from '../schemas/album-tag.js';
import AlbumTagService from '../services/album-tag-service.js';
import { BaseController } from './base-controller.js';
import { uploadObject } from './helpers.js';

const albumTagService = new AlbumTagService();

export default class AlbumTagController extends BaseController {
  findAll: RouteHandler = async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const albumTags = await albumTagService.findAll();

      return this.ok<AlbumTag[]>(reply, 'ok', albumTags);
    } catch (err: any) {
      console.error(`Failed to query album tags: ${err}`);
      return this.fail(reply, 'Failed to query album tags');
    }
  };

  create: RouteHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const tag: AlbumTag = request.body as AlbumTag;
    console.log(tag);
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
  };

  delete: RouteHandler = async (request: FastifyRequest, reply: FastifyReply) => {
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
  };

  findOne: RouteHandler = async () => {
    throw new Error('Method not implemented.');
  };

  update: RouteHandler = async () => {
    throw new Error('Method not implemented.');
  };
}
