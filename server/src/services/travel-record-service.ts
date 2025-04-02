import { TravelRecord, TravelRecordEntity } from '../schemas/travel-record.js';
import { DynamodbService } from './dynamodb-service.js';

export default class TravelRecordService extends DynamodbService<TravelRecord> {
  constructor() {
    super();
    this.entity = TravelRecordEntity;
  }
}
