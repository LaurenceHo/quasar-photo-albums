import { STATUS_ERROR, STATUS_SUCCESS } from '../constants';
import { AlbumTag, BaseController } from '../models';
import AlbumTagService from '../services/album-tag-service';
import { uploadObject } from './helpers';
import { Request, Response } from 'express';

const albumTagService = new AlbumTagService();
const tableName = process.env.PHOTO_ALBUM_TAGS_TABLE_NAME;

export default class AlbumTagController implements BaseController {
  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const albumTags = await albumTagService.findAll({
        TableName: tableName,
      });

      res.send(albumTags);
    } catch (err: any) {
      console.error(`Failed to query album tags: ${err}`);
      res.status(500).send({ status: STATUS_ERROR, message: 'Failed to query album tags' });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    const tag: AlbumTag = req.body;
    try {
      const result = await albumTagService.create({
        TableName: tableName,
        Item: {
          tag: tag.tag,
        },
      });
      if (result) {
        res.send({ status: STATUS_SUCCESS, message: 'Album tag created' });
        await uploadObject('updateDatabaseAt.json', JSON.stringify({ time: new Date().toISOString() }));
      }
    } catch (err) {
      console.error(`Failed to create album tag: ${err}`);
      res.status(500).send({ status: STATUS_ERROR, message: 'Failed to create album tag' });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    const tag = req.params['tagId'];
    try {
      const result = await albumTagService.delete({
        TableName: tableName,
        Key: {
          tag,
        },
      });
      if (result) {
        res.send({ status: STATUS_SUCCESS, message: 'Album tag deleted' });
        await uploadObject('updateDatabaseAt.json', JSON.stringify({ time: new Date().toISOString() }));
      }
    } catch (err) {
      console.error(`Failed to delete album tag: ${err}`);
      res.status(500).send({ status: STATUS_ERROR, message: 'Failed to delete album tag' });
    }
  }
}
