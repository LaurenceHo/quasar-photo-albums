import { Database } from '@cloudflare/d1';

export class D1Service<T> {
  private readonly db: Database;
  private readonly tableName: string;

  constructor(db: Database, tableName: string) {
    this.db = db;
    this.tableName = tableName;
  }

  async getAll(): Promise<T[]> {
    const stmt = this.db.prepare(`SELECT * FROM ${this.tableName}`);
    const { results } = await stmt.all();
    return (results as T[]) || [];
  }

  async getById(id: string): Promise<T | null> {
    const stmt = this.db.prepare(`SELECT * FROM ${this.tableName} WHERE id = ?`);
    return (await stmt.bind(id).first()) as T | null;
  }

  async findAll(where: Partial<T>): Promise<T[]> {
    const { clause, values } = this.buildWhereClause(where);
    const stmt = this.db.prepare(`SELECT * FROM ${this.tableName} WHERE ${clause}`);
    const { results } = await stmt.bind(...values).all();
    return (results as T[]) || [];
  }

  async findOne(where: Partial<T>): Promise<T | null> {
    const { clause, values } = this.buildWhereClause(where);
    const stmt = this.db.prepare(`SELECT * FROM ${this.tableName} WHERE ${clause}`);
    return (await stmt.bind(...values).first()) as T | null;
  }

  async create(item: T): Promise<any> {
    const keys = Object.keys(item as object).join(', ');
    const values = Object.values(item as object);
    const placeholders = values.map(() => '?').join(', ');

    const stmt = this.db.prepare(
      `INSERT INTO ${this.tableName} (${keys}) VALUES (${placeholders})`,
    );
    return await stmt.bind(...values).run();
  }

  async update(id: string, item: Partial<T>): Promise<any> {
    const keys = Object.keys(item as object);
    const values = Object.values(item as object);
    const setClause = keys.map((key) => `${key} = ?`).join(', ');

    const stmt = this.db.prepare(`UPDATE ${this.tableName} SET ${setClause} WHERE id = ?`);
    return await stmt.bind(...values, id).run();
  }

  async delete(id: string): Promise<any> {
    const stmt = this.db.prepare(`DELETE FROM ${this.tableName} WHERE id = ?`);
    return await stmt.bind(id).run();
  }

  private buildWhereClause(where: Partial<T>): { clause: string; values: any[] } {
    const keys = Object.keys(where as object);
    const values = Object.values(where as object);
    const clause = keys.map((key) => `${key} = ?`).join(' AND ');
    return { clause, values };
  }
}
