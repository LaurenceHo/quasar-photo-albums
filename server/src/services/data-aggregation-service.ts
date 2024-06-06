import { DataAggregation, DataAggregationEntity } from '../schemas/aggregation.js';
import { DynamodbService } from './dynamodb-service.js';

export default class DataAggregationService extends DynamodbService<DataAggregation<any>> {
  constructor() {
    super();
    this.entity = DataAggregationEntity;
  }
}
