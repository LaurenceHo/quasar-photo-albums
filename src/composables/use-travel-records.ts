import { TravelRecordService } from '@/services/travel-record-service';
import { useQuery } from '@tanstack/vue-query';
import { computed } from 'vue';

export default function useTravelRecords() {
  const { isFetching, data } = useQuery({
    queryKey: ['getTravelRecords'],
    queryFn: TravelRecordService.getTravelRecords,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const travelRecords = computed(() => {
    return data.value?.data?.map((travelRecord) => ({
      departure: travelRecord.departure?.location,
      destination: travelRecord.destination?.location,
    }));
  });

  return {
    isFetching,
    travelRecords
  };
}
