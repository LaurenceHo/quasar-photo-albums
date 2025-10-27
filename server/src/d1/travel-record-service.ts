import { TravelRecord } from '../types/types';
import { D1Service } from './d1-service';
import { Database } from '@cloudflare/d1';

const travelRecordTableName = 'travel-records';

export default class TravelRecordService extends D1Service<TravelRecord> {
  constructor(db: Database) {
    super(db, travelRecordTableName);
  }
}
