import { TravelRecord } from '../types/types';
import { D1Service } from './d1-service';
import { Database } from '@cloudflare/d1';

const travelRecordTableName = 'travel-records';

export default class TravelRecordService extends D1Service<TravelRecord> {
  constructor(db: Database) {
    super(db, travelRecordTableName);
  }

  async listTravelRecords(): Promise<TravelRecord[]> {
    return this.getAll();
  }

  async getTravelRecord(id: string): Promise<TravelRecord | null> {
    return this.getById(id);
  }

  async createTravelRecord(item: Omit<TravelRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<any> {
    const now = new Date().toISOString();
    const newRecord: TravelRecord = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    return this.create(newRecord);
  }

  async updateTravelRecord(id: string, item: Partial<Omit<TravelRecord, 'id' | 'createdAt' | 'updatedAt'>>): Promise<any> {
    const updatedRecord: Partial<TravelRecord> = {
      ...item,
      updatedAt: new Date().toISOString(),
    };
    return this.update(id, updatedRecord);
  }

  async deleteTravelRecord(id: string): Promise<any> {
    return this.delete(id);
  }
}
