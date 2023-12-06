import { AlbumTag } from '../models';
import { DynamoDbService } from './dynamo-db-service';

export default class AlbumTagService extends DynamoDbService<AlbumTag> {
  constructor() {
    super();
    this.tableName = process.env.PHOTO_ALBUM_TAGS_TABLE_NAME;
  }
}
