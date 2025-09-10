import { mockAlbums } from '@/mocks/album-handler';
import { ApiBaseUrl } from '@/services/api-base-url';
import { BaseApiRequestService } from '@/services/base-api-request-service';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AlbumService } from '../album-service';

// Mock the BaseApiRequestService
vi.mock('@/services/base-api-request-service', () => ({
  BaseApiRequestService: {
    perform: vi.fn()
  }
}));

describe('AlbumService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getAlbumsByYear', () => {
    it('should call BaseApiRequestService.perform with correct parameters', async () => {
      const mockResponse = { ok: true, json: vi.fn().mockResolvedValue([]) };
      (BaseApiRequestService.perform as any).mockResolvedValue(mockResponse);

      await AlbumService.getAlbumsByYear('2023');

      expect(BaseApiRequestService.perform).toHaveBeenCalledWith('GET', `${ApiBaseUrl}/albums/2023`);
    });

    it('should use "na" as default year if not provided', async () => {
      const mockResponse = { ok: true, json: vi.fn().mockResolvedValue([]) };
      (BaseApiRequestService.perform as any).mockResolvedValue(mockResponse);

      await AlbumService.getAlbumsByYear();

      expect(BaseApiRequestService.perform).toHaveBeenCalledWith('GET', `${ApiBaseUrl}/albums/na`);
    });

    it('should return the JSON response from the API', async () => {
      const mockAlbums = [
        { id: '1', title: 'Album 1' },
        { id: '2', title: 'Album 2' }
      ];
      const mockResponse = { ok: true, json: vi.fn().mockResolvedValue(mockAlbums) };
      (BaseApiRequestService.perform as any).mockResolvedValue(mockResponse);

      const result = await AlbumService.getAlbumsByYear('2023');

      expect(result).toEqual(mockAlbums);
    });

    it('should throw an error if the API request fails', async () => {
      const mockResponse = { ok: false, statusText: 'Not Found' };
      (BaseApiRequestService.perform as any).mockResolvedValue(mockResponse);

      await expect(AlbumService.getAlbumsByYear('2023')).rejects.toThrow('Not Found');
    });
  });

  describe('createAlbum', () => {
    it('should call BaseApiRequestService.perform with correct parameters', async () => {
      const mockResponse = { ok: true, json: vi.fn().mockResolvedValue({ status: 'success' }) };
      (BaseApiRequestService.perform as any).mockResolvedValue(mockResponse);

      await AlbumService.createAlbum(mockAlbums[0]!);

      expect(BaseApiRequestService.perform).toHaveBeenCalledWith('POST', `${ApiBaseUrl}/albums`, mockAlbums[0]);
    });

    it('should return the ResponseStatus from the API', async () => {
      const mockStatus = { status: 'success' };
      const mockResponse = { ok: true, json: vi.fn().mockResolvedValue(mockStatus) };
      (BaseApiRequestService.perform as any).mockResolvedValue(mockResponse);

      const result = await AlbumService.createAlbum(mockAlbums[0]!);

      expect(result).toEqual(mockStatus);
    });

    it('should throw an error if the API request fails', async () => {
      const mockResponse = { ok: false, statusText: 'Bad Request' };
      (BaseApiRequestService.perform as any).mockResolvedValue(mockResponse);

      await expect(AlbumService.createAlbum(mockAlbums[0]!)).rejects.toThrow('Bad Request');
    });
  });

  describe('updateAlbum', () => {
    it('should call BaseApiRequestService.perform with correct parameters', async () => {
      const mockResponse = { ok: true, json: vi.fn().mockResolvedValue({ status: 'success' }) };
      (BaseApiRequestService.perform as any).mockResolvedValue(mockResponse);

      await AlbumService.updateAlbum(mockAlbums[1]!);

      expect(BaseApiRequestService.perform).toHaveBeenCalledWith('PUT', `${ApiBaseUrl}/albums`, mockAlbums[1]!);
    });

    it('should return the ResponseStatus from the API', async () => {
      const mockStatus = { status: 'success' };
      const mockResponse = { ok: true, json: vi.fn().mockResolvedValue(mockStatus) };
      (BaseApiRequestService.perform as any).mockResolvedValue(mockResponse);

      const result = await AlbumService.updateAlbum(mockAlbums[2]!);

      expect(result).toEqual(mockStatus);
    });

    it('should throw an error if the API request fails', async () => {
      const mockResponse = { ok: false, statusText: 'Not Found' };
      (BaseApiRequestService.perform as any).mockResolvedValue(mockResponse);

      await expect(AlbumService.updateAlbum(mockAlbums[1]!)).rejects.toThrow('Not Found');
    });
  });

  describe('deleteAlbum', () => {
    it('should call BaseApiRequestService.perform with correct parameters', async () => {
      const mockResponse = { ok: true, json: vi.fn().mockResolvedValue({ status: 'success' }) };
      (BaseApiRequestService.perform as any).mockResolvedValue(mockResponse);

      await AlbumService.deleteAlbum('1', '2023');

      expect(BaseApiRequestService.perform).toHaveBeenCalledWith('DELETE', `${ApiBaseUrl}/albums`, {
        id: '1',
        year: '2023'
      });
    });

    it('should return the ResponseStatus from the API', async () => {
      const mockStatus = { status: 'success' };
      const mockResponse = { ok: true, json: vi.fn().mockResolvedValue(mockStatus) };
      (BaseApiRequestService.perform as any).mockResolvedValue(mockResponse);

      const result = await AlbumService.deleteAlbum('1', '2023');

      expect(result).toEqual(mockStatus);
    });

    it('should throw an error if the API request fails', async () => {
      const mockResponse = { ok: false, statusText: 'Not Found' };
      (BaseApiRequestService.perform as any).mockResolvedValue(mockResponse);

      await expect(AlbumService.deleteAlbum('1', '2023')).rejects.toThrow('Not Found');
    });
  });
});
