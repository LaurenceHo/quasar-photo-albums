import { Album, AlbumEntity } from '../schemas/album.js';
import { DynamodbService } from './dynamodb-service.js';

export default class AlbumService extends DynamodbService<Album> {
  constructor() {
    super();
    this.entity = AlbumEntity;
  }
}
