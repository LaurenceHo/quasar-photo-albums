import { TravelRecord } from '../types/travel-record';
import { D1Service } from './d1-service';

const travelRecordTableName = 'travel_records';

export default class TravelRecordService extends D1Service<TravelRecord> {
  constructor(db: D1Database) {
    super(db, travelRecordTableName);
  }
}
