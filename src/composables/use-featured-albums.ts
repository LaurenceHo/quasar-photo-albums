import type { Album as AlbumItem, ApiResponse } from '@/schema';
import { AggregateService } from '@/services/aggregate-service';
import { compareDbUpdatedTime, fetchDbUpdatedTime } from '@/utils/helper';
import { FEATURED_ALBUMS } from '@/utils/local-storage-key';
import { useQuery } from '@tanstack/vue-query';
import { get } from 'radash';

interface FeaturedAlbums {
  dbUpdatedTime: string;
  albums: AlbumItem[];
}

/** Get featured albums and set to local storage **/
const _fetchFeaturedAlbumsAndSetToLocalStorage = async (dbUpdatedTime?: string | null) => {
  let time = dbUpdatedTime;
  if (!time) {
    const timeJson = await fetchDbUpdatedTime();
    time = timeJson?.album || '';
  }

  const {
    data: albums,
    code,
    message,
  } = (await AggregateService.getAggregateData('featuredAlbums')) as ApiResponse<AlbumItem[]>;
  if (code !== 200) {
    throw Error(message);
  }

  if (albums) {
    localStorage.setItem(
      FEATURED_ALBUMS,
      JSON.stringify({
        dbUpdatedTime: time,
        albums,
      } as FeaturedAlbums),
    );
  }
};

export default function useFeaturedAlbums() {
  const { data, isFetching } = useQuery({
    queryKey: ['featuredAlbums'],
    queryFn: async () => {
      const storedData = localStorage.getItem(FEATURED_ALBUMS);
      if (!storedData) {
        await _fetchFeaturedAlbumsAndSetToLocalStorage();
      } else {
        try {
          const parsedData = JSON.parse(storedData) as FeaturedAlbums;
          const compareResult = await compareDbUpdatedTime(parsedData.dbUpdatedTime, 'album');
          if (!compareResult.isLatest) {
            await _fetchFeaturedAlbumsAndSetToLocalStorage(compareResult.dbUpdatedTime);
          }
        } catch (error) {
          console.error('Failed to parse stored featured albums:', error);
          await _fetchFeaturedAlbumsAndSetToLocalStorage();
        }
      }

      try {
        const finalData = localStorage.getItem(FEATURED_ALBUMS);
        if (!finalData) return [];
        const parsedData = JSON.parse(finalData) as FeaturedAlbums;
        return get(parsedData, 'albums', []) as AlbumItem[];
      } catch (error) {
        console.error('Failed to retrieve featured albums:', error);
        return [];
      }
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return { data, isFetching };
}
