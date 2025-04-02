import { TravelRecordService } from '@/services/travel-record-service';
import { interpolateGreatCircle } from '@/utils/helper';
import { useQuery } from '@tanstack/vue-query';
import type { Position } from 'geojson';
import { computed } from 'vue';

export default function useTravelRecords() {
  const { isFetching, data } = useQuery({
    queryKey: ['getTravelRecords'],
    queryFn: TravelRecordService.getTravelRecords,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const travelRecords = computed(() =>
    data.value?.data?.map((travelRecord) => ({
      departure: travelRecord.departure?.location,
      destination: travelRecord.destination?.location,
    })),
  );

  const travelRecordGeoJson = computed(() => {
    const coordinates: Position[][] = [];
    travelRecords.value?.forEach((record) => {
      coordinates.push(
        ...interpolateGreatCircle(
          [record.departure?.longitude ?? 0, record.departure?.latitude ?? 0],
          [record.destination?.longitude ?? 0, record.destination?.latitude ?? 0],
          20,
        ),
      );
    });

    return {
      type: 'Feature',
      geometry: {
        type: 'MultiLineString',
        coordinates: coordinates,
      },
      properties: {},
    } as any;
  });

  return {
    isFetching,
    travelRecordGeoJson,
  };
}
