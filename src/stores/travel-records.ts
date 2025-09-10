import type { TravelRecord } from '@/schema';
import { TravelRecordService } from '@/services/travel-record-service';
import {
  compareDbUpdatedTime,
  fetchDbUpdatedTime,
  getDataFromLocalStorage,
  interpolateGreatCircle,
  setDataIntoLocalStorage,
} from '@/utils/helper';
import { TRAVEL_RECORDS } from '@/utils/local-storage-key';
import { useQuery, useQueryClient } from '@tanstack/vue-query';
import type { Feature, FeatureCollection, LineString } from 'geojson';
import { defineStore } from 'pinia';
import { computed } from 'vue';

export interface TravelRecords {
  dbUpdatedTime: string;
  travelRecords: TravelRecord[];
}

const _shouldRefetch = async (forceUpdate = false): Promise<boolean> => {
  const stored = getDataFromLocalStorage(TRAVEL_RECORDS);
  if (!stored) return true;
  if (forceUpdate) return true;
  const { isLatest } = await compareDbUpdatedTime(stored.dbUpdatedTime, 'travel');
  return !isLatest;
};

const _fetchTravelRecordsAndSetToLocalStorage = async (
  forceRefetch: boolean = false,
): Promise<TravelRecord[]> => {
  try {
    // Bypass _shouldRefetch if forceRefetch is true
    if (!(await _shouldRefetch(forceRefetch))) {
      const travelRecordsWithDBTime = getDataFromLocalStorage(TRAVEL_RECORDS) as TravelRecords;
      return travelRecordsWithDBTime ? travelRecordsWithDBTime.travelRecords : [];
    }

    const timeJson = await fetchDbUpdatedTime();
    const { data: travelRecords, code, message } = await TravelRecordService.getTravelRecords();

    if (code !== 200) {
      console.error('Error fetching travel records:', message);
      return [];
    }

    if (travelRecords) {
      setDataIntoLocalStorage(TRAVEL_RECORDS, {
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

  const travelRecordGeoJson = computed<FeatureCollection<LineString>>(() => {
    const features: Feature<LineString>[] = (data.value ?? []).reduce(
      (acc: Feature<LineString>[], record) => {
        // Validate coordinates
        if (
          record.departure?.location?.latitude == null ||
          record.departure?.location?.longitude == null ||
          record.destination?.location?.latitude == null ||
          record.destination?.location?.longitude == null
        ) {
          console.warn(`Skipping travel record with ID ${record.id} due to missing coordinates`);
          return acc;
        }

        const segments = interpolateGreatCircle(
          [record.departure!.location!.longitude, record.departure!.location!.latitude],
          [record.destination!.location!.longitude, record.destination!.location!.latitude],
          20,
        );

        if (!segments || segments.length === 0) {
          console.warn(`Skipping travel record with ID ${record.id} due to missing coordinates`);
          return acc;
        }

        const coordinates = segments[0];

        if (!coordinates) {
          console.warn(`Skipping travel record with ID ${record.id} due to missing coordinates`);
          return acc;
        }

        acc.push({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates,
          },
          properties: {
            transportType: record.transportType || 'flight', // Use record.transportType, fallback to 'flight'
          },
        });

        return acc;
      },
      [],
    );

    return {
      type: 'FeatureCollection',
      features,
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
