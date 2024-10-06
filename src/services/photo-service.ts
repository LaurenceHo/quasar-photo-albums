import type { ApiResponse, PhotoResponse, ResponseStatus } from '@/schema';
import { ApiBaseUrl } from '@/services/api-base-url';
import { BaseApiRequestService } from '@/services/base-api-request-service';

export const PhotoService = {
  getPhotosByAlbumId: async (albumId: string, year: string): Promise<ApiResponse<PhotoResponse>> => {
    const response = await BaseApiRequestService.perform('GET', `${ApiBaseUrl}/photos/${year}/${albumId}`);

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  },

  uploadPhotos: async (file: File, albumId: string): Promise<ResponseStatus> => {
    const response = await BaseApiRequestService.perform('POST', `${ApiBaseUrl}/photos/upload/${albumId}`, null, null, {
      file
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  },

  /**
   * Move photos from one album to another
   * @param albumId Original album ID
   * @param destinationAlbumId Destination album ID
   * @param photoKeys Keys of photos to be moved
   */
  movePhotos: async (albumId: string, destinationAlbumId: string, photoKeys: string[]): Promise<ResponseStatus> => {
    const response = await BaseApiRequestService.perform('PUT', `${ApiBaseUrl}/photos`, {
      albumId,
      destinationAlbumId,
      photoKeys
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  },

  deletePhotos: async (albumId: string, photoKeys: string[]): Promise<ResponseStatus> => {
    const response = await BaseApiRequestService.perform('DELETE', `${ApiBaseUrl}/photos`, { albumId, photoKeys });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  },

  renamePhoto: async (albumId: string, newPhotoKey: string, currentPhotoKey: string): Promise<ResponseStatus> => {
    const response = await BaseApiRequestService.perform('PUT', `${ApiBaseUrl}/photos/rename`, {
      albumId,
      newPhotoKey, // Without album id
      currentPhotoKey // Without album id
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  }
};
