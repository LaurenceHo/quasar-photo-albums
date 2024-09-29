import type { AlbumTag, ApiResponse } from '@/schema';
import { ApiBaseUrl } from '@/services/api-base-url';
import { BaseApiRequestService } from '@/services/base-api-request-service';

export const AlbumTagService = {
  getAlbumTags: async (): Promise<ApiResponse<AlbumTag[]>> => {
    const response = await BaseApiRequestService.perform('GET', `${ApiBaseUrl}/albumTags`);
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return response.json();
  },

  createAlbumTags: async (tags: AlbumTag[]): Promise<ApiResponse<AlbumTag>> => {
    const response = await BaseApiRequestService.perform('POST', `${ApiBaseUrl}/albumTags`, tags);
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return response.json();
  },

  deleteAlbumTag: async (tagId: string): Promise<ApiResponse<AlbumTag>> => {
    const response = await BaseApiRequestService.perform('DELETE', `${ApiBaseUrl}/albumTags/${tagId}`);
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return response.json();
  },
};
