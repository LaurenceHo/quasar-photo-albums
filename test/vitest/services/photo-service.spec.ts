import { beforeEach, describe, expect, it, vi } from 'vitest';
import HttpRequestService from '../../../src/services/http-request-service';
import PhotoService from '../../../src/services/photo-service';

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

    photoService.getPhotosByAlbumId('test-album-id', '2024');
    expect(mockSetDisplayingParameters).toHaveBeenCalledWith(true);
    expect(mockPerform).toHaveBeenCalledWith('GET', '/2024/test-album-id');
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

  it('Call movePhotos API with correct parameters', () => {
    const photoService = new PhotoService();

    photoService.movePhotos('test-album-id3', 'test-destination-album-id', ['photo-key-1', 'photo-key-2']);
    expect(mockSetDisplayingParameters).toHaveBeenCalledWith(true, 'Photos moved');
    expect(mockPerform).toHaveBeenCalledWith('PUT', '', {
      albumId: 'test-album-id3',
      destinationAlbumId: 'test-destination-album-id',
      photoKeys: ['photo-key-1', 'photo-key-2'],
    });
  });

  it('Call renamePhoto API with correct parameters', () => {
    const photoService = new PhotoService();

    photoService.renamePhoto('test-album-id4', 'new-photo-key', 'current-photo');
    expect(mockSetDisplayingParameters).toHaveBeenCalledWith(true, 'Photo renamed');
    expect(mockPerform).toHaveBeenCalledWith('PUT', '/rename', {
      albumId: 'test-album-id4',
      currentPhotoKey: 'current-photo',
      newPhotoKey: 'new-photo-key',
    });
  });

  it('Call deletePhotos API with correct parameters', () => {
    const photoService = new PhotoService();

    photoService.deletePhotos('test-album-id5', ['photo-key-3', 'photo-key-4']);
    expect(mockSetDisplayingParameters).toHaveBeenCalledWith(true, 'Photos deleted');
    expect(mockPerform).toHaveBeenCalledWith('DELETE', '', {
      albumId: 'test-album-id5',
      photoKeys: ['photo-key-3', 'photo-key-4'],
    });
  });
});
