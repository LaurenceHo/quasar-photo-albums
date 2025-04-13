import { defineStore } from 'pinia';
import { TravelRecordService } from '@/services/travel-record-service';
import { interpolateGreatCircle } from '@/utils/helper';
import { useQuery } from '@tanstack/vue-query';
import { computed } from 'vue';
import type { Position, Feature, MultiLineString } from 'geojson';

export const useTravelRecordsStore = defineStore('travelRecords', () => {
  // Query for fetching travel records
  const { isFetching, data } = useQuery({
    queryKey: ['getTravelRecords'],
    queryFn: TravelRecordService.getTravelRecords,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // Computed property for GeoJSON
  const travelRecordGeoJson = computed<Feature<MultiLineString>>(() => {
    const coordinates: Position[][] = [];
    data.value?.data
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
    travelRecords: computed(() => data.value?.data ?? []),
    isFetching,
    travelRecordGeoJson,
  };
});
