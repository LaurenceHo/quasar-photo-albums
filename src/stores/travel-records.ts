import { useQuery, useQueryClient } from '@tanstack/vue-query';
import { defineStore } from 'pinia';
import { computed } from 'vue';
import type { TravelRecord } from '@/schema';
import { TravelRecordService } from '@/services/travel-record-service';
import { compareDbUpdatedTime, fetchDbUpdatedTime, interpolateGreatCircle } from '@/utils/helper';
import { TRAVEL_RECORDS } from '@/utils/local-storage-key';
import type { Feature, MultiLineString, Position } from 'geojson';

export interface TravelRecords {
  dbUpdatedTime: string;
  travelRecords: TravelRecord[];
}

const _getStoredTravelRecords = (): TravelRecords | null => {
  const stored = localStorage.getItem(TRAVEL_RECORDS);
  return stored ? JSON.parse(stored) : null;
};

const _storeTravelRecords = (data: TravelRecords) => {
  localStorage.setItem(TRAVEL_RECORDS, JSON.stringify(data));
};

const _shouldRefetch = async (): Promise<boolean> => {
  const stored = _getStoredTravelRecords();
  if (!stored) return true;
  const { isLatest } = await compareDbUpdatedTime(stored.dbUpdatedTime, 'travel');
  return !isLatest;
};

const _fetchTravelRecordsAndSetToLocalStorage = async (
  forceRefetch: boolean = false,
): Promise<TravelRecord[]> => {
  try {
    // Bypass _shouldRefetch if forceRefetch is true
    if (!forceRefetch && !(await _shouldRefetch())) {
      const travelRecordsWithDBTime = _getStoredTravelRecords();
      return travelRecordsWithDBTime ? travelRecordsWithDBTime.travelRecords : [];
    }

    const timeJson = await fetchDbUpdatedTime();
    const { data: travelRecords, code, message } = await TravelRecordService.getTravelRecords();

    if (code !== 200) {
      throw new Error(message);
    }

    if (travelRecords) {
      _storeTravelRecords({
        dbUpdatedTime: timeJson?.travel || '',
        travelRecords,
      });
      return travelRecords;
    }

    return [];
  } catch (error) {
    console.error('Error fetching travel records:', error);
    throw error;
  }
};

export const useTravelRecordsStore = defineStore('travelRecords', () => {
  const queryClient = useQueryClient();

  const {
    isFetching,
    data,
    error,
    refetch: refetchQuery,
  } = useQuery({
    queryKey: ['getTravelRecords'],
    queryFn: () => _fetchTravelRecordsAndSetToLocalStorage(false), // Default to no force refetch
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 0,
  });

  // Custom refetch function with forceRefetch flag
  const refetchTravelRecords = async (forceRefetch = false) => {
    if (forceRefetch) {
      // Invalidate cache to ensure fresh query
      await queryClient.invalidateQueries({ queryKey: ['getTravelRecords'] });
      // Update query data with forceRefetch
      return queryClient.fetchQuery({
        queryKey: ['getTravelRecords'],
        queryFn: () => _fetchTravelRecordsAndSetToLocalStorage(true),
      });
    }
    // Default refetch without forcing
    return refetchQuery();
  };

  const travelRecordGeoJson = computed<Feature<MultiLineString>>(() => {
    const coordinates: Position[][] = [];
    data.value
      ?.map((travelRecord) => ({
        departure: travelRecord.departure?.location,
        destination: travelRecord.destination?.location,
      }))
      ?.forEach((record) => {
        const interpolated = interpolateGreatCircle(
          [record.departure?.longitude ?? 0, record.departure?.latitude ?? 0],
          [record.destination?.longitude ?? 0, record.destination?.latitude ?? 0],
          20,
        );
        coordinates.push(...interpolated);
      });

    return {
      type: 'Feature',
      geometry: {
        type: 'MultiLineString',
        coordinates,
      },
      properties: {},
    };
  });

  return {
    travelRecords: computed(() => data.value ?? []),
    isFetching,
    error: computed(() => error.value),
    travelRecordGeoJson,
    refetchTravelRecords,
  };
});
