import logger from 'pino';

export class D1Client {
  private readonly baseUrl: string;
  private readonly table: string;
  private readonly jsonColumns: string[];

  constructor(table: string, jsonColumns: string[] = []) {
    this.table = table;
    this.jsonColumns = jsonColumns;
    this.baseUrl = process.env['WORKER_URL']!;
    if (!this.baseUrl) {
      throw new Error('WORKER_URL is not set');
    }
  }

  private get url() {
    return `${this.baseUrl.replace(/\/+$/, '')}/${this.table}`;
  }

  private async request<T = any>(path: string = '', init?: RequestInit): Promise<T> {
    const url = path ? `${this.url}${path}` : this.url;
    const response = await fetch(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`D1 Worker error ${response.status}: ${text}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return response.json();
    }
    return (await response.text()) as any;
  }

  private parseJsonFields<T>(item: any): T {
    const parsed = { ...item };
    for (const col of this.jsonColumns) {
      if (typeof parsed[col] === 'string') {
        try {
          parsed[col] = JSON.parse(parsed[col]);
        } catch (e) {
          logger().warn(`Failed to parse JSON in column ${col}:`, parsed[col], e);
          parsed[col] = null; // or keep as string
        }
      }
    }
    return parsed as T;
  }

  // GET /table
  async getAll<T>(): Promise<T[]> {
    const items: any[] = await this.request('');
    return items.map((item) => this.parseJsonFields<T>(item));
  }

  // GET /table/:id
  async getById<T>(id: string): Promise<T> {
    const item: any = await this.request(`/${id}`);
    return this.parseJsonFields<T>(item);
  }

  // POST /table
  async create<T>(data: T): Promise<string> {
    return this.request('' as any, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT /table/:id
  async update<T>(id: string, data: Partial<T>): Promise<string> {
    return this.request(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE /table/:id
  async delete(id: string): Promise<string> {
    return this.request(`/${id}`, { method: 'DELETE' });
  }

  async find<T>(params: Record<string, string | number | boolean>): Promise<T[]> {
    const search = new URLSearchParams(
      Object.entries(params).map(([k, v]) => [k, String(v)]),
    ).toString();
    return this.request<T[]>(`?${search}`);
  }
}
