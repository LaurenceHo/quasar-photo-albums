import { afterEach, describe, expect, it, vi } from 'vitest';
import { app } from '../../src/app';
import { mockAlbumList, mockPhotoList, mockSignedCookies } from '../mock-data';

vi.mock('../../src/d1/d1-client', async () => {
  const { mockAlbumList } = await import('../mock-data');
  return {
    D1Client: class {
      constructor(table: string) {}
      async getById(id: string) {
        return mockAlbumList[2]; // private album
      }
      async update() {
        return 'updated';
      }
    },
  };
});

vi.mock('../../src/services/s3-service', async () => {
  const { mockPhotoList } = await import('../mock-data');
  return {
    default: class {
      findAll() {
        return Promise.resolve(mockPhotoList);
      }
    },
  };
});

vi.mock('../../src/controllers/helpers', async () => ({
  // updatePhotoAlbum: () => Promise.resolve(true), // Removed
}));

describe('private album route', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return correct photos', async () => {
    const response = await app.inject({
      method: 'get',
      url: '/api/photos/2024/test',
      headers: {
        Cookie: `jwt=${mockSignedCookies()}`,
      },
    });

    expect(response.payload).toBe(
      JSON.stringify({
        code: 200,
        status: 'Success',
        message: 'ok',
        data: {
          album: mockAlbumList[2],
          photos: mockPhotoList,
        },
      }),
    );
  });

  it('should return 401', async () => {
    const response = await app.inject({
      method: 'get',
      url: '/api/photos/2024/test',
    });
    expect(response.statusCode).toBe(401);
  });
});
