import { FastifyReply, FastifyRequest, RouteHandler } from 'fastify';
import { AlbumTag } from '../schemas/album-tag.js';
import AlbumService from '../services/album-service.js';
import AlbumTagService from '../services/album-tag-service.js';
import { RequestWithUser } from '../types';
import { BaseController } from './base-controller.js';
import { updateDatabaseAt } from './helpers.js';

const albumTagService = new AlbumTagService();
const albumService = new AlbumService();

export default class AlbumTagController extends BaseController {
  findAll: RouteHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const albumTags = await albumTagService.findAll();

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

    try {
      const result = await albumTagService.create(tagsToCreate);

      if (result) {
        await updateDatabaseAt('album');
        return this.ok(reply, 'Album tag created');
      }

      return this.fail(reply, 'Failed to create album tag');
    } catch (err) {
      request.log.error(`Failed to create album tag: ${err}`);
      return this.fail(reply, 'Failed to create album tag');
    }
  };

  delete: RouteHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const tag = (request.params as any)['tagId'] as string;
    try {
      request.log.info('##### Delete tag:', tag);
      const result = await albumTagService.delete({ tag });

      if (result) {
        const findAlbumsContainingTag = await albumService.findAll(
          'scan',
          null,
          ['year', 'id', 'tags'],
          ({ tags }: any, { contains }: any) => `${contains(tags, tag)}`,
        );

        const promises: Promise<any>[] = [];
        for (const album of findAlbumsContainingTag) {
          const { year, id } = album;
          const cloneAlbum: any = { ...album };

          cloneAlbum.updatedBy = (request as RequestWithUser).user?.email ?? 'unknown';
          cloneAlbum.updatedAt = new Date().toISOString();
          cloneAlbum.tags = cloneAlbum.tags.filter((t: string) => t !== tag);
          delete cloneAlbum.year;
          delete cloneAlbum.id;

          promises.push(albumService.update({ year, id }, cloneAlbum));
        }

        await Promise.all(promises);
        await updateDatabaseAt('album');
        return this.ok(reply, 'Album tag deleted');
      }

      return this.fail(reply, 'Failed to delete album tag');
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
