import { AlbumTag } from '../models';
import { AlbumTagEntity, albumTagsTableName } from '../schemas/album-tag';
import { DynamodbService } from './dynamodb-service';

export default class AlbumTagService extends DynamodbService<AlbumTag> {
  constructor() {
    super();
    this.tableName = albumTagsTableName;
    this.entity = AlbumTagEntity;
  }
}
