import { AlbumTag, BaseController } from '../models';
import AlbumTagService from '../services/album-tag-service';
import { uploadObject } from './helpers';
import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import JsonResponse from '../utils/json-response';

const albumTagService = new AlbumTagService();
const tableName = process.env.PHOTO_ALBUM_TAGS_TABLE_NAME;

export default class AlbumTagController implements BaseController {
  findAll = asyncHandler(async (req: Request, res: Response) => {
    try {
      const albumTags = await albumTagService.findAll({
        TableName: tableName,
      });

      return new JsonResponse().success(res, '', albumTags);
    } catch (err: any) {
      console.error(`Failed to query album tags: ${err}`);
      return new JsonResponse(500).error(res, 'Failed to query album tags');
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
        return new JsonResponse().success(res, 'Album tag created', null);
      }
      return new JsonResponse(500).error(res, 'Failed to create album tag');
    } catch (err) {
      console.error(`Failed to create album tag: ${err}`);
      return new JsonResponse(500).error(res, 'Failed to create album tag');
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
        return new JsonResponse().success(res, 'Album tag deleted', null);
      }
      return new JsonResponse(500).error(res, 'Failed to delete album tag');
    } catch (err) {
      console.error(`Failed to delete album tag: ${err}`);
      return new JsonResponse(500).error(res, 'Failed to delete album tag');
    }
  });
}
