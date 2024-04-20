import { describe, expect, it, vi, afterEach } from 'vitest';
import { app } from '../../src/app';
import { mockAlbumList } from '../mock-data';

vi.mock('../../src/services/album-service', () => ({
  default: vi.fn().mockImplementation(() => ({
    findAll: () => Promise.resolve(mockAlbumList),
    create: () => Promise.resolve(true),
    update: () => Promise.resolve(true),
    delete: () => Promise.resolve(true),
  })),
}));

vi.mock('../../src/routes/auth-middleware', async (importOriginal) => ({
  verifyJwtClaim: () => Promise.resolve(),
  verifyUserPermission: () => Promise.resolve(),
}));

vi.mock('../../src/controllers/helpers', async () => ({
  updatePhotoAlbum: () => Promise.resolve(true),
  emptyS3Folder: () => Promise.resolve(true),
  uploadObject: () => Promise.resolve(true),
}));

describe('album route', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return correct albums', async () => {
    const response = await app.inject({ method: 'get', url: '/api/albums' });
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

  describe('create album', () => {
    it('should return 200', async () => {
      const response = await app.inject({
        method: 'post',
        url: '/api/albums',
        payload: {
          id: 'Test-album',
          albumCover: '',
          albumName: 'Test album',
          description: '',
          isPrivate: true,
          order: 4,
        },
      });
      expect(response.statusCode).toBe(200);
      expect(response.payload).toBe(
        JSON.stringify({
          code: 200,
          status: 'Success',
          message: 'Album created',
        })
      );
    });

    it('should return 422 bad request when body is empty', async () => {
      const response = await app.inject({ method: 'post', url: '/api/albums' });
      expect(response.statusCode).toBe(422);
    });
  });

  describe('update album', () => {
    it('should return 200', async () => {
      const response = await app.inject({
        method: 'put',
        url: '/api/albums',
        payload: {
          id: 'Test-album',
          albumCover: '',
          albumName: 'Test album',
          description: '',
          isPrivate: true,
          order: 4,
        },
      });
      expect(response.statusCode).toBe(200);
      expect(response.payload).toBe(
        JSON.stringify({
          code: 200,
          status: 'Success',
          message: 'Album updated',
        })
      );
    });
  });

  describe('delete album', () => {
    it('should return 200', async () => {
      const response = await app.inject({ method: 'delete', url: '/api/albums/test' });
      expect(response.statusCode).toBe(200);
    });
  });
});
