import { describe, expect, it, vi } from 'vitest';
import { app } from '../../src/app';

import { mockAlbumList } from '../mock-data';

const helperMock = vi.hoisted(() => ({
  verifyIfIsAdmin: vi.fn(() => true),
}));

vi.mock('../../src/d1/d1-client', async () => {
  const { mockAlbumList } = await import('../mock-data');

  return {
    D1Client: class {
      constructor(table: string) { }
      async find(params: any) {
        if (params.type === 'albumsWithLocation') {
          return mockAlbumList;
        } else if (params.type === 'countAlbumsByYear') {
          if (params.includePrivate) {
            return [
              { year: '2018', count: 1 },
              { year: '2019', count: 11 },
              { year: '2020', count: 10 },
              { year: '2021', count: 20 },
            ];
          } else {
            return [
              { year: '2020', count: 10 },
              { year: '2021', count: 20 },
            ];
          }
        }
        return [];
      }
    },
  };
});

vi.mock('../../src/controllers/helpers', () => ({
  verifyIfIsAdmin: () => helperMock.verifyIfIsAdmin,
}));

describe("aggregate route when it's admin", () => {
  it('should return album list', async () => {
    const response = await app.inject({ method: 'get', url: '/api/aggregate/albumsWithLocation' });
    expect(response.payload).toBe(
      JSON.stringify({
        code: 200,
        status: 'Success',
        message: 'ok',
        data: mockAlbumList,
      }),
    );
  });

  it('should return count albums include private album', async () => {
    const response = await app.inject({ method: 'get', url: '/api/aggregate/countAlbumsByYear' });
    expect(response.payload).toBe(
      JSON.stringify({
        code: 200,
        status: 'Success',
        message: 'ok',
        data: [
          { year: '2018', count: 1 },
          { year: '2019', count: 11 },
          { year: '2020', count: 10 },
          { year: '2021', count: 20 },
        ],
      }),
    );
  });

  it('should return 400 bad request', async () => {
    const response = await app.inject({ method: 'get', url: '/api/aggregate/invalidType' });
    expect(response.statusCode).toBe(400);
  });
});
