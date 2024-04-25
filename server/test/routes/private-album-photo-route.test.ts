import { afterEach, describe, expect, it, vi } from 'vitest';
import { app } from '../../src/app';
import { updatePhotoAlbum } from '../../src/controllers/helpers';
import { mockAlbumList, mockPhotoList } from '../mock-data';

vi.mock('../../src/services/album-service', () => ({
  default: vi.fn().mockImplementation(() => ({
    findOne: () => Promise.resolve(mockAlbumList[2]), // private album
  })),
}));

vi.mock('../../src/services/s3-service', () => ({
  default: vi.fn().mockImplementation(() => ({
    findAll: () => Promise.resolve(mockPhotoList),
  })),
}));

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
      url: '/api/photos/test',
      headers: {
        Cookie:
          'jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJ0ZXN0LXVpZCIsImVtYWlsIjoidGVzdC51c2VyQHRlc3QuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzE0MDEyMjE0LCJleHAiOjE3MTQ2MTcwMTR9.-cJBPNzoFzLOSJb-LDQY31vzejfqVPxfBQZPiBegpv0.dc5i6%2FxNGuN6cJrsj8VGx%2BQRrzm55bporpaiHxTgV8M',
      },
    });
    expect(updatePhotoAlbum).toBe(mocks.updatePhotoAlbum);
    expect(mocks.updatePhotoAlbum).toHaveBeenCalledOnce();

    expect(response.payload).toBe(
      JSON.stringify({
        code: 200,
        status: 'Success',
        message: 'ok',
        data: mockPhotoList,
      })
    );
  });

  it('should return 401', async () => {
    const response = await app.inject({
      method: 'get',
      url: '/api/photos/test',
    });
    expect(response.statusCode).toBe(401);
  });
});
