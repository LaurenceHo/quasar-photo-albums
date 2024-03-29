import { AlbumTag, AlbumTagEntity } from '../schemas/album-tag';
import { DynamodbService } from './dynamodb-service';

export default class AlbumTagService extends DynamodbService<AlbumTag> {
  constructor() {
    super();
    this.entity = AlbumTagEntity;
  }
}
