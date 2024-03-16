import { AlbumTag } from '../models';
import { DynamodbService } from './dynamodb-service';

export default class AlbumTagService extends DynamodbService<AlbumTag> {
  constructor() {
    super();
    this.tableName = process.env.PHOTO_ALBUM_TAGS_TABLE_NAME;
  }
}
