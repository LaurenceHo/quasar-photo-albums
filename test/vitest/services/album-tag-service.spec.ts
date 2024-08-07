import { beforeEach, describe, expect, it, vi } from 'vitest';
import AlbumTagService from '../../../src/services/album-tag-service';
import HttpRequestService from '../../../src/services/http-request-service';

const mockPerform = vi.spyOn(HttpRequestService.prototype, 'perform').mockImplementation(() => Promise.resolve());
const mockSetDisplayingParameters = vi
  .spyOn(HttpRequestService.prototype, 'setDisplayingParameters')
  .mockImplementation(() => vi.fn());

beforeEach(() => {
  mockSetDisplayingParameters.mockClear();
  mockPerform.mockClear();
});

describe('album-tag-service.ts', () => {
  it('Call getAlbumTags API with correct parameters', () => {
    const albumTagService = new AlbumTagService();

    albumTagService.getAlbumTags();
    expect(mockSetDisplayingParameters).toHaveBeenCalledWith(
      false,
      undefined,
      true,
      'Ooops, can not get album categories, please try again later'
    );
    expect(mockPerform).toHaveBeenCalledWith('GET', '');
  });

  it('Call createAlbumTag API with correct parameters', () => {
    const albumTagService = new AlbumTagService();

    albumTagService.createAlbumTags([
      {
        tag: 'test-tag',
      },
    ]);
    expect(mockSetDisplayingParameters).toHaveBeenCalledWith(true, 'Tag created');
    expect(mockPerform).toHaveBeenCalledWith('POST', '', [
      {
        tag: 'test-tag',
      },
    ]);
  });

  it('Call deleteAlbumTag API with correct parameters', () => {
    const albumTagService = new AlbumTagService();

    albumTagService.deleteAlbumTag('tag-id');
    expect(mockSetDisplayingParameters).toHaveBeenCalledWith(true, 'Tag deleted');
    expect(mockPerform).toHaveBeenCalledWith('DELETE', '/tag-id');
  });
});
