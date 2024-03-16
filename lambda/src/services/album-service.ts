import { Album } from '../models';
import { DynamodbService } from './dynamodb-service';

export default class AlbumService extends DynamodbService<Album> {
  constructor() {
    super();
    this.tableName = process.env.PHOTO_ALBUMS_TABLE_NAME;
  }
}
