import { Album } from '../models';
import { DynamoDbService } from './dynamo-db-service';

export default class AlbumService extends DynamoDbService<Album> {
  constructor() {
    super();
  }
}
