import { Album, AlbumEntity } from '../schemas/album';
import { DynamodbService } from './dynamodb-service';

export default class AlbumService extends DynamodbService<Album> {
  constructor() {
    super();
    this.entity = AlbumEntity;
  }
}
