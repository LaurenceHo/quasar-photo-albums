import { Album, AlbumEntity, albumTableName } from '../schemas/album';
import { DynamodbService } from './dynamodb-service';

export default class AlbumService extends DynamodbService<Album> {
  constructor() {
    super();
    this.tableName = albumTableName;
    this.entity = AlbumEntity;
  }
}
