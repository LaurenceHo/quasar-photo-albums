import { TravelRecord } from '../types/travel-record';
import { D1Service } from './d1-service';

const travelRecordTableName = 'travel_records';

export default class TravelRecordService extends D1Service<TravelRecord> {
  constructor(db: D1Database) {
    super(db, travelRecordTableName);
  }

  override async getAll(where?: Partial<TravelRecord>): Promise<TravelRecord[]> {
    const results = await super.getAll(where);
    return results.map((item) => this.mapTravelRecord(item));
  }

  override async getById(id: string): Promise<TravelRecord | null> {
    const result = await super.getById(id);
    return result ? this.mapTravelRecord(result) : null;
  }

  private mapTravelRecord(item: any): TravelRecord {
    // Parse departure
    if (item.departure && typeof item.departure === 'string') {
      try {
        item.departure = JSON.parse(item.departure);
      } catch (e) {
        item.departure = undefined;
      }
    }

    // Parse destination
    if (item.destination && typeof item.destination === 'string') {
      try {
        item.destination = JSON.parse(item.destination);
      } catch (e) {
        item.destination = undefined;
      }
    }

    return item as TravelRecord;
  }
}
