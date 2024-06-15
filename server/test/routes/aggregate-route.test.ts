import { describe, expect, it, vi } from 'vitest';
import { app } from '../../src/app';
import { ALBUMS_WITH_LOCATION, COUNT_ALBUMS_BY_YEAR } from '../../src/schemas/aggregation';
import { mockAlbumList } from '../mock-data';

vi.mock('../../src/services/data-aggregation-service', () => ({
  default: vi.fn().mockImplementation(() => ({
    findOne: ({ key }) => {
      if (key === ALBUMS_WITH_LOCATION) {
        return Promise.resolve({
          key: ALBUMS_WITH_LOCATION,
          value: mockAlbumList,
        });
      } else if (key === COUNT_ALBUMS_BY_YEAR) {
        return Promise.resolve({
          key: COUNT_ALBUMS_BY_YEAR,
          value: [
            { year: '2020', count: 10 },
            { year: '2021', count: 20 },
          ],
        });
      }
      return Promise.reject('Invalid key');
    },
  })),
}));

describe('aggregate route', () => {
  it('should return album list', async () => {
    const response = await app.inject({ method: 'get', url: '/api/aggregate/albumsWithLocation' });
    expect(response.statusCode).toBe(200);
    expect(response.payload).toBe(
      JSON.stringify({
        code: 200,
        status: 'Success',
        message: 'ok',
        data: mockAlbumList,
      })
    );
  });

  it('should return count albums', async () => {
    const response = await app.inject({ method: 'get', url: '/api/aggregate/countAlbumsByYear' });
    expect(response.statusCode).toBe(200);
    expect(response.payload).toBe(
      JSON.stringify({
        code: 200,
        status: 'Success',
        message: 'ok',
        data: [
          { year: '2020', count: 10 },
          { year: '2021', count: 20 },
        ],
      })
    );
  });

  it('should return 400 bad request', async () => {
    const response = await app.inject({ method: 'get', url: '/api/aggregate/invalidType' });
    expect(response.statusCode).toBe(400);
  });
});
