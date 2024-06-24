import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { app } from '../../src/app';
import { mockAlbumList } from '../mock-data';

const authMock = vi.hoisted(() => ({
  verifyJwtClaim: vi.fn(() => Promise.resolve()),
  verifyUserPermission: vi.fn(() => Promise.resolve()),
}));

vi.mock('../../src/controllers/helpers', async () => ({
  updatePhotoAlbum: () => Promise.resolve(true),
  emptyS3Folder: () => Promise.resolve(true),
  uploadObject: () => Promise.resolve(true),
}));

vi.mock('../../src/routes/auth-middleware', async () => ({
  verifyJwtClaim: () => authMock.verifyJwtClaim(),
  verifyUserPermission: () => authMock.verifyUserPermission(),
}));

vi.mock('../../src/services/album-service', () => ({
  default: vi.fn().mockImplementation(() => ({
    findAll: () => Promise.resolve(mockAlbumList),
    create: () => Promise.resolve(true),
    update: () => Promise.resolve(true),
    delete: () => Promise.resolve(true),
  })),
}));

vi.mock('../../src/services/album-tag-service', () => ({
  default: vi.fn().mockImplementation(() => ({
    findAll: () => Promise.resolve([{ tag: 'sport' }, { tag: 'food' }, { tag: 'hiking' }]),
    create: () => Promise.resolve(true),
    delete: () => Promise.resolve(true),
  })),
}));

describe('album tag route with auth', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return 422 when adding tag and request body is empty', async () => {
    const response = await app.inject({ method: 'post', url: '/api/albumTags' });
    expect(response.statusCode).toBe(422);
  });

  it('should return 422 when adding tag and request body is not array', async () => {
    const response = await app.inject({
      method: 'post',
      url: '/api/albumTags',
      payload: {
        tag: 'tag1',
      },
    });
    expect(response.payload).toBe(JSON.stringify({ code: 422, status: 'Bad Request', message: 'body must be array' }));
  });

  it('should return 200 when adding tag', async () => {
    const response = await app.inject({
      method: 'post',
      url: '/api/albumTags',
      payload: [
        {
          tag: 'tag1',
        },
      ],
    });
    expect(response.payload).toBe(
      JSON.stringify({
        code: 200,
        status: 'Success',
        message: 'Album tag created',
      })
    );
  });

  it('should return 404 when tag is missing', async () => {
    const response = await app.inject({ method: 'delete', url: '/api/albumTags' });
    expect(response.statusCode).toBe(404);
  });

  it('should return 200 when deleting tag', async () => {
    const response = await app.inject({ method: 'delete', url: '/api/albumTags/tag1' });
    expect(response.payload).toBe(
      JSON.stringify({
        code: 200,
        status: 'Success',
        message: 'Album tag deleted',
      })
    );
  });
});

describe('album tag route without auth', () => {
  beforeEach(() => {
    authMock.verifyJwtClaim.mockRejectedValue(() => false);
    authMock.verifyUserPermission.mockRejectedValue(() => false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return correct tags', async () => {
    const response = await app.inject({ method: 'get', url: '/api/albumTags' });
    expect(response.payload).toBe(
      JSON.stringify({
        code: 200,
        status: 'Success',
        message: 'ok',
        data: [{ tag: 'sport' }, { tag: 'food' }, { tag: 'hiking' }],
      })
    );
  });

  it('where creating tag, should return 401 error when unauthorized', async () => {
    const response = await app.inject({ method: 'post', url: '/api/albumTags' });
    expect(response.statusCode).toBe(401);
  });

  it('when deleting tag, should return 401 error when unauthorized', async () => {
    const response = await app.inject({ method: 'delete', url: '/api/albumTags/tag1' });
    expect(response.statusCode).toBe(401);
  });
});
