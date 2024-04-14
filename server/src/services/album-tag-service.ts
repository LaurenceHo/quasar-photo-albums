import { AlbumTag, AlbumTagEntity } from '../schemas/album-tag.js';
import { DynamodbService } from './dynamodb-service.js';

export default class AlbumTagService extends DynamodbService<AlbumTag> {
  constructor() {
    super();
    this.entity = AlbumTagEntity;
  }
}
