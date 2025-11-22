import { describe, expect, it, vi } from 'vitest';
import { app } from '../../src/app';
import {
  ALBUMS_WITH_LOCATION,
  COUNT_ALBUMS_BY_YEAR,
  COUNT_ALBUMS_BY_YEAR_EXCLUDE_PRIVATE,
} from '../../src/schemas/aggregation';
import { mockAlbumList } from '../mock-data';

const helperMock = vi.hoisted(() => ({
  verifyIfIsAdmin: vi.fn(() => true),
}));

vi.mock('../../src/services/data-aggregation-service', async () => {
  const {
    ALBUMS_WITH_LOCATION,
    COUNT_ALBUMS_BY_YEAR,
    COUNT_ALBUMS_BY_YEAR_EXCLUDE_PRIVATE,
  } = await import('../../src/schemas/aggregation');
  const { mockAlbumList } = await import('../mock-data');

  return {
    default: class {
      findOne({ key }: { key: string }) {
        if (key === ALBUMS_WITH_LOCATION) {
          return Promise.resolve({
            key: ALBUMS_WITH_LOCATION,
            value: mockAlbumList,
          });
        } else if (key === COUNT_ALBUMS_BY_YEAR_EXCLUDE_PRIVATE) {
          return Promise.resolve({
            key: COUNT_ALBUMS_BY_YEAR,
            value: [
              { year: '2020', count: 10 },
              { year: '2021', count: 20 },
            ],
          });
        } else if (key === COUNT_ALBUMS_BY_YEAR) {
          return Promise.resolve({
            key: COUNT_ALBUMS_BY_YEAR,
            value: [
              { year: '2018', count: 1 },
              { year: '2019', count: 11 },
              { year: '2020', count: 10 },
              { year: '2021', count: 20 },
            ],
          });
        }
        return Promise.reject('Invalid key');
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
