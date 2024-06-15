import { describe, expect, it, vi } from 'vitest';
import { app } from '../../src/app';

vi.mock('../../src/controllers/helpers', async () => ({
  perform: () =>
    Promise.resolve({
      places: [
        {
          formattedAddress: 'Auckland, New Zealand',
          location: { latitude: -36.85088270000001, longitude: 174.7644881 },
          displayName: { text: 'Auckland', languageCode: 'en' },
        },
      ],
    }),
}));

describe('location route', () => {
  it('should return 422 bad request', async () => {
    const response = await app.inject({ method: 'get', url: '/api/location/search' });
    expect(response.statusCode).toBe(422);
  });

  it('should return correct location', async () => {
    const response = await app.inject({ method: 'get', url: '/api/location/search?textQuery=somewhere' });

    expect(response.statusCode).toBe(200);
    expect(response.payload).toBe(
      JSON.stringify({
        code: 200,
        status: 'Success',
        message: 'ok',
        data: [
          {
            displayName: 'Auckland',
            formattedAddress: 'Auckland, New Zealand',
            location: { latitude: -36.85088270000001, longitude: 174.7644881 },
          },
        ],
      })
    );
  });
});
