import type { ApiResponse, ResponseStatus, TravelRecord } from '@/schema';
import { ApiBaseUrl } from '@/services/api-base-url';
import { BaseApiRequestService } from '@/services/base-api-request-service';

export const TravelRecordService = {
  getTravelRecords: async (): Promise<ApiResponse<TravelRecord[]>> => {
    const response = await BaseApiRequestService.perform('GET', `${ApiBaseUrl}/travelRecords`);
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return response.json();
  },

  createTravelRecords: async (travelRecord: TravelRecord): Promise<ResponseStatus> => {
    const response = await BaseApiRequestService.perform(
      'POST',
      `${ApiBaseUrl}/travelRecords`,
      travelRecord,
    );
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return response.json();
  },

  updateTravelRecords: async (travelRecord: TravelRecord): Promise<ResponseStatus> => {
    const response = await BaseApiRequestService.perform(
      'PUT',
      `${ApiBaseUrl}/travelRecords`,
      travelRecord,
    );
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return response.json();
  },

  deleteTravelRecord: async (recordId: string): Promise<ResponseStatus> => {
    const response = await BaseApiRequestService.perform(
      'DELETE',
      `${ApiBaseUrl}/travelRecords/${recordId}`,
    );
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return response.json();
  },
};
