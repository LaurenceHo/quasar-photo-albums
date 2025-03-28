import formAutoContent from 'form-auto-content';
import fs from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { app } from '../../src/app';
import { mockAlbumList, mockPhotoList } from '../mock-data';

vi.mock('../../src/services/s3-service', () => ({
  default: vi.fn().mockImplementation(() => ({
    findAll: () => Promise.resolve(mockPhotoList),
    copy: () => Promise.resolve(true),
  })),
}));

vi.mock('../../src/routes/auth-middleware', async () => ({
  verifyJwtClaim: () => Promise.resolve(),
  verifyUserPermission: () => Promise.resolve(),
}));

vi.mock('../../src/controllers/helpers', async () => ({
  deleteObjects: () => Promise.resolve(true),
  updatePhotoAlbum: () => Promise.resolve(true),
  uploadObject: () => Promise.resolve(true),
}));

vi.mock('../../src/services/album-service', () => ({
  default: vi.fn().mockImplementation(() => ({
    findOne: () => Promise.resolve(mockAlbumList[0]),
  })),
}));

describe('photo route', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return correct photos', async () => {
    const response = await app.inject({ method: 'get', url: '/api/photos/2024/test' });
    expect(response.statusCode).toBe(200);
    expect(response.payload).toBe(
      JSON.stringify({
        code: 200,
        status: 'Success',
        message: 'ok',
        data: {
          album: mockAlbumList[0],
          photos: mockPhotoList,
        },
      }),
    );
  });

  describe('upload photo', () => {
    it('should return 200', async () => {
      const response = await app.inject({
        method: 'get',
        url: '/api/photos/upload/test?filename=test.jpg&mimeType=image/jpeg',
      });
      expect(response.statusCode).toBe(200);
      expect(JSON.stringify(response.payload)).toContain('uploadUrl');
    });
  });

  describe('Move photo', () => {
    it('should return 200', async () => {
      const response = await app.inject({
        method: 'put',
        url: '/api/photos',
        payload: {
          albumId: 'Test-album',
          destinationAlbumId: 'test-album-1',
          photoKeys: ['test-photo-1'],
        },
      });
      expect(response.statusCode).toBe(200);
      expect(response.payload).toBe(
        JSON.stringify({
          code: 200,
          status: 'Success',
          message: 'Photo moved',
        }),
      );
    });

    it('should return 422 bad request', async () => {
      const response = await app.inject({ method: 'put', url: '/api/photos' });
      expect(response.statusCode).toBe(422);
    });
  });

  describe('Rename photo', () => {
    it('should return 200', async () => {
      const response = await app.inject({
        method: 'put',
        url: '/api/photos/rename',
        payload: {
          albumId: 'Test-album',
          newPhotoKey: 'test-photo-1',
          currentPhotoKey: 'test-photo-2',
        },
      });
      expect(response.statusCode).toBe(200);
      expect(response.payload).toBe(
        JSON.stringify({
          code: 200,
          status: 'Success',
          message: 'Photo renamed',
        }),
      );
    });

    it('should return 422 bad request', async () => {
      const response = await app.inject({ method: 'put', url: '/api/photos/rename' });
      expect(response.statusCode).toBe(422);
    });
  });

  describe('delete delete', () => {
    it('should return 200', async () => {
      const response = await app.inject({
        method: 'delete',
        url: '/api/photos',
        payload: {
          albumId: 'Test-album',
          photoKeys: ['test-photo-1'],
        },
      });
      expect(response.statusCode).toBe(200);
      expect(response.payload).toBe(
        JSON.stringify({
          code: 200,
          status: 'Success',
          message: 'Photo deleted',
        }),
      );
    });

    it('should return 422', async () => {
      const response = await app.inject({ method: 'delete', url: '/api/photos' });
      expect(response.statusCode).toBe(422);
    });
  });
});
