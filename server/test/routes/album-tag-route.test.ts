import { describe, expect, it, vi } from 'vitest';
import { app } from '../../src/app';

vi.mock('../../src/services/album-tag-service', () => ({
  default: vi.fn().mockImplementation(() => ({
    findAll: () => Promise.resolve([{ tag: 'sport' }, { tag: 'food' }, { tag: 'hiking' }]),
  })),
}));

describe('album tag route', () => {
  it('should return correct tags', async () => {
    const response = await app.inject({ method: 'get', url: '/api/albumTags' });
    expect(response.statusCode).toBe(200);
    expect(response.payload).toBe(
      JSON.stringify({
        code: 200,
        status: 'Success',
        message: 'ok',
        data: [{ tag: 'sport' }, { tag: 'food' }, { tag: 'hiking' }],
      })
    );
  });

  it('should return 401 error when unauthorized', async () => {
    const response = await app.inject({ method: 'post', url: '/api/albumTags' });
    expect(response.statusCode).toBe(401);
  });
});
