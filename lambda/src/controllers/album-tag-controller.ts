import { AlbumTag } from '../models';
import AlbumTagService from '../services/album-tag-service';
import { BaseController } from './base-controller';
import { uploadObject } from './helpers';
import { Request, RequestHandler, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';

const albumTagService = new AlbumTagService();

export default class AlbumTagController extends BaseController {
  findAll: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    try {
      const albumTags = await albumTagService.findAll({
        TableName: albumTagService.tableName,
      });

      return this.ok<AlbumTag[]>(res, 'ok', albumTags);
    } catch (err: any) {
      console.error(`Failed to query album tags: ${err}`);
      return this.fail(res, 'Failed to query album tags');
    }
  });

  create: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const tag: AlbumTag = req.body;
    try {
      const result = await albumTagService.create(tag);
      if (result) {
        await uploadObject('updateDatabaseAt.json', JSON.stringify({ time: new Date().toISOString() }));
        return this.ok(res, 'Album tag created');
      }
      return this.fail(res, 'Failed to create album tag');
    } catch (err) {
      console.error(`Failed to create album tag: ${err}`);
      return this.fail(res, 'Failed to create album tag');
    }
  });

  delete: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const tag = req.params['tagId'];
    try {
      const result = await albumTagService.delete({ tag });
      if (result) {
        await uploadObject('updateDatabaseAt.json', JSON.stringify({ time: new Date().toISOString() }));
        return this.ok(res, 'Album tag deleted');
      }
      return this.fail(res, 'Failed to delete album tag');
    } catch (err) {
      console.error(`Failed to delete album tag: ${err}`);
      return this.fail(res, 'Failed to delete album tag');
    }
  });

  findOne: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    throw new Error('Method not implemented.');
  });

  update: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    throw new Error('Method not implemented.');
  });
}
