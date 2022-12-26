import { beforeEach, describe, expect, it, vi } from 'vitest';
import PhotoService from '../../../../src/services/photo-service';
import HttpRequestService from '../../../../src/services/http-request-service';

const mockPerform = vi.spyOn(HttpRequestService.prototype, 'perform').mockImplementation(() => Promise.resolve());
const mockSetDisplayingParameters = vi
  .spyOn(HttpRequestService.prototype, 'setDisplayingParameters')
  .mockImplementation(() => vi.fn());

beforeEach(() => {
  mockSetDisplayingParameters.mockClear();
  mockPerform.mockClear();
});

describe('photo-service.ts', () => {
  it('Call getPhotosByAlbumId API with correct parameters', () => {
    const photoService = new PhotoService();

    photoService.getPhotosByAlbumId('test-album-id');
    expect(mockSetDisplayingParameters).toHaveBeenCalledWith(true);
    expect(mockPerform).toHaveBeenCalledWith('GET', '/test-album-id');
  });

  it('Call uploadPhotos API with correct parameters', () => {
    const photoService = new PhotoService();

    photoService.uploadPhotos(
      {
        file: 'test-file',
      },
      'test-album-id2'
    );
    expect(mockSetDisplayingParameters).toHaveBeenCalledWith(true);
    expect(mockPerform).toHaveBeenCalledWith('POST', '/upload/test-album-id2', null, null, {
      file: {
        file: 'test-file',
      },
    });
  });
});
