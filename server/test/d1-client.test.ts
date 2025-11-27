import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { D1Client } from '../src/d1/d1-client';

describe('D1Client', () => {
  const originalFetch = global.fetch;
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, WORKER_URL: 'http://localhost', WORKER_SECRET: 'secret' };
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env = originalEnv;
  });

  it('should parse JSON fields in find() results', async () => {
    const mockResponse = [{ id: '1', place: '{"city": "Valencia"}', other: 'value' }];

    (global.fetch as any).mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => mockResponse,
    });

    const client = new D1Client('albums', ['place']);
    const results = await client.find({ year: '2024' });

    expect(results).toHaveLength(1);
    expect((results[0] as any).place).toEqual({ city: 'Valencia' });
    expect((results[0] as any).other).toEqual('value');
  });

  it('should parse JSON fields in getAll() results', async () => {
    const mockResponse = [
      {
        id: '1',
        departure: '{"location": {"lat": 1, "lng": 2}}',
        destination: '{"location": {"lat": 3, "lng": 4}}',
      },
    ];

    (global.fetch as any).mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => mockResponse,
    });

    const client = new D1Client('travel_records', ['departure', 'destination']);
    const results = await client.getAll();

    expect(results).toHaveLength(1);
    expect((results[0] as any).departure).toEqual({ location: { lat: 1, lng: 2 } });
    expect((results[0] as any).destination).toEqual({ location: { lat: 3, lng: 4 } });
  });

  it('should parse JSON fields in getById() result', async () => {
    const mockResponse = { id: '1', place: '{"city": "Valencia"}' };

    (global.fetch as any).mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => mockResponse,
    });

    const client = new D1Client('albums', ['place']);
    const result = await client.getById('1');

    expect((result as any).place).toEqual({ city: 'Valencia' });
  });

  it('should handle invalid JSON gracefully', async () => {
    const mockResponse = [{ id: '1', place: 'invalid-json' }];

    (global.fetch as any).mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => mockResponse,
    });

    const client = new D1Client('albums', ['place']);
    const results = await client.find({ year: '2024' });

    expect((results[0] as any).place).toBeNull();
  });
});
