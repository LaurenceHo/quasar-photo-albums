import { afterEach, describe, expect, it, vi } from 'vitest';
import { app } from '../../src/app';
import { updatePhotoAlbum } from '../../src/controllers/helpers';
import { mockAlbumList, mockPhotoList, mockSignedCookies } from '../mock-data';

vi.mock('../../src/services/album-service', async () => {
  const { mockAlbumList } = await import('../mock-data');
  return {
    default: class {
      findOne() {
        return Promise.resolve(mockAlbumList[2]); // private album
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
  updatePhotoAlbum: () => Promise.resolve(true),
}));

const mocks = vi.hoisted(() => {
  return {
    updatePhotoAlbum: vi.fn().mockResolvedValue(true),
  };
});

vi.mock('../../src/controllers/helpers', () => {
  return {
    updatePhotoAlbum: mocks.updatePhotoAlbum,
  };
});

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
    expect(updatePhotoAlbum).toBe(mocks.updatePhotoAlbum);
    expect(mocks.updatePhotoAlbum).toHaveBeenCalledOnce();

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
