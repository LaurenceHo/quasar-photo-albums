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
  }
};
