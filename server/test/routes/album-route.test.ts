import { afterEach, describe, expect, it, vi } from 'vitest';
import { app } from '../../src/app';
import { Album } from '../../src/schemas/album';
import { mockAlbumList } from '../mock-data';

vi.mock('../../src/services/album-service', () => ({
  default: vi.fn().mockImplementation(() => ({
    findAll: (method?: string) => {
      if (method === 'scan') {
        return Promise.resolve([]);
      } else {
        return Promise.resolve(mockAlbumList);
      }
    },
    create: () => Promise.resolve(true),
    update: () => Promise.resolve(true),
    delete: () => Promise.resolve(true),
  })),
}));

vi.mock('../../src/routes/auth-middleware', async () => ({
  verifyJwtClaim: () => Promise.resolve(),
  verifyUserPermission: () => Promise.resolve(),
}));

vi.mock('../../src/controllers/helpers', async () => ({
  updateDatabaseAt: () => Promise.resolve(true),
  updatePhotoAlbum: () => Promise.resolve(true),
  emptyS3Folder: () => Promise.resolve(true),
  uploadObject: () => Promise.resolve(true),
  verifyIfIsAdmin: () => true,
}));

describe('album route', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should return correct albums', async () => {
    const response = await app.inject({ method: 'get', url: '/api/albums/2024' });
    expect(response.statusCode).toBe(200);
    expect(response.payload).toBe(
      JSON.stringify({
        code: 200,
        status: 'Success',
        message: 'ok',
        data: mockAlbumList,
      }),
    );
  });

  describe('create album', () => {
    it('should return 200', async () => {
      const response = await app.inject({
        method: 'post',
        url: '/api/albums',
        payload: {
          year: '2024',
          id: 'test-album',
          albumCover: '',
          albumName: 'Test album',
          description: '',
          isPrivate: true,
        } as Album,
      });
      expect(response.statusCode).toBe(200);
      expect(response.payload).toBe(
        JSON.stringify({
          code: 200,
          status: 'Success',
          message: 'Album created',
        }),
      );
    });

    it('should return 422 bad request when body is empty', async () => {
      const response = await app.inject({ method: 'post', url: '/api/albums' });
      expect(response.statusCode).toBe(422);
    });

    it('should return 422 bad request when album year is an empty string', async () => {
      const response = await app.inject({
        method: 'post',
        url: '/api/albums',
        payload: {
          year: '',
          id: 'test-album',
          albumName: 'Test album',
          isPrivate: true,
        } as Album,
      });
      expect(response.statusCode).toBe(422);
    });

    it('should return 422 bad request when id is an empty string', async () => {
      const response = await app.inject({
        method: 'post',
        url: '/api/albums',
        payload: {
          year: '2024',
          id: '',
          albumName: 'Test album',
          isPrivate: true,
        } as Album,
      });
      expect(response.statusCode).toBe(422);
    });

    it('should return 422 bad request when albumName is missing', async () => {
      const response = await app.inject({
        method: 'post',
        url: '/api/albums',
        payload: {
          year: '2024',
          id: 'test-id',
          isPrivate: true,
        } as Album,
      });
      expect(response.statusCode).toBe(422);
    });
  });

  describe('update album', () => {
    it('should return 200', async () => {
      const response = await app.inject({
        method: 'put',
        url: '/api/albums',
        payload: {
          year: '2024',
          id: 'test-album',
          albumCover: '',
          albumName: 'Test album',
          description: '',
          isPrivate: true,
        } as Album,
      });
      expect(response.statusCode).toBe(200);
      expect(response.payload).toBe(
        JSON.stringify({
          code: 200,
          status: 'Success',
          message: 'Album updated',
        }),
      );
    });
  });

  describe('delete album', () => {
    it('should return 200', async () => {
      const response = await app.inject({
        method: 'delete',
        url: '/api/albums',
        payload: {
          year: '2024',
          id: 'test-album',
        },
      });
      expect(response.statusCode).toBe(200);
    });
  });
});
