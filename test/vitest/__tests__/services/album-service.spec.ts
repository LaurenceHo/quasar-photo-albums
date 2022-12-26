import { beforeEach, describe, expect, it, vi } from 'vitest';
import AlbumService from '../../../../src/services/album-service';
import HttpRequestService from '../../../../src/services/http-request-service';
import { mockAlbum } from '../mock-data';

const mockPerform = vi.spyOn(HttpRequestService.prototype, 'perform').mockImplementation(() => Promise.resolve());
const mockSetDisplayingParameters = vi
  .spyOn(HttpRequestService.prototype, 'setDisplayingParameters')
  .mockImplementation(() => vi.fn());

beforeEach(() => {
  mockSetDisplayingParameters.mockClear();
  mockPerform.mockClear();
});

describe('album-service.ts', () => {
  it('Call getAlbums API with correct parameters', () => {
    const albumService = new AlbumService();

    albumService.getAlbums();
    expect(mockSetDisplayingParameters).toHaveBeenCalledWith(false);
    expect(mockPerform).toHaveBeenCalledWith('GET', '');
  });

  it('Call createAlbum API with correct parameters', () => {
    const albumService = new AlbumService();

    albumService.createAlbum(mockAlbum);
    expect(mockSetDisplayingParameters).toHaveBeenCalledWith(true, 'Album "Sport" created');
    expect(mockPerform).toHaveBeenCalledWith('POST', '', mockAlbum);
  });

  it('Call updateAlbum API with correct parameters', () => {
    const albumService = new AlbumService();

    albumService.updateAlbum(mockAlbum);
    expect(mockSetDisplayingParameters).toHaveBeenCalledWith(true, 'Album "Sport" updated');
    expect(mockPerform).toHaveBeenCalledWith('PUT', '', mockAlbum);
  });

  it('Call deleteAlbum API with correct parameters', () => {
    const albumService = new AlbumService();

    albumService.deleteAlbum('testAlbumId');
    expect(mockSetDisplayingParameters).toHaveBeenCalledWith(true, 'Album deleted');
    expect(mockPerform).toHaveBeenCalledWith('DELETE', '/testAlbumId');
  });
});
