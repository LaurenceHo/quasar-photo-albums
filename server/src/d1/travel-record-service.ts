import { TravelRecord } from '../types/travel-record';
import { D1Service } from './d1-service';
import { Database } from '@cloudflare/d1';

const travelRecordTableName = 'travel_records';

export default class TravelRecordService extends D1Service<TravelRecord> {
  constructor(db: Database) {
    super(db, travelRecordTableName);
  }
}
