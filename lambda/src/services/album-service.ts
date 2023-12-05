import { Album } from '../models';
import { DynamoDbService } from './dynamo-db-service';

export default class AlbumService extends DynamoDbService<Album> {
  constructor() {
    super();
    this.tableName = process.env.PHOTO_ALBUMS_TABLE_NAME;
  }
}
