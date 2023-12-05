import { AlbumTag } from '../models';
import AlbumTagService from '../services/album-tag-service';
import { BaseController } from './base-controller';
import { uploadObject } from './helpers';
import { Request, RequestHandler, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';

const albumTagService = new AlbumTagService();
const tableName = process.env.PHOTO_ALBUM_TAGS_TABLE_NAME;

export default class AlbumTagController extends BaseController {
  findAll = asyncHandler(async (req: Request, res: Response) => {
    try {
      const albumTags = await albumTagService.findAll({
        TableName: tableName,
      });

      return this.ok<AlbumTag[]>(res, 'ok', albumTags);
    } catch (err: any) {
      console.error(`Failed to query album tags: ${err}`);
      return this.fail(res, 'Failed to query album tags');
    }
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const tag: AlbumTag = req.body;
    try {
      const result = await albumTagService.create({
        TableName: tableName,
        Item: {
          tag: tag.tag,
        },
      });
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

  delete = asyncHandler(async (req: Request, res: Response) => {
    const tag = req.params['tagId'];
    try {
      const result = await albumTagService.delete({
        TableName: tableName,
        Key: {
          tag,
        },
      });
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
