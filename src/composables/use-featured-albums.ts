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
const _fetchFeaturedAlbumsAndSetToLocalStorage = async (dbUpdatedTime?: string) => {
  let time = dbUpdatedTime;
  if (!time) {
    time = await fetchDbUpdatedTime();
  }

  const {
    data: albums,
    code,
    message
  } = (await AggregateService.getAggregateData('featuredAlbums')) as ApiResponse<AlbumItem[]>;
  if (code !== 200) {
    throw Error(message);
  }

  if (albums) {
    localStorage.setItem(
      FEATURED_ALBUMS,
      JSON.stringify({
        dbUpdatedTime: time,
        albums
      } as FeaturedAlbums)
    );
  }
};

export default function useFeaturedAlbums() {
  const { data, isFetching } = useQuery({
    queryKey: ['featuredAlbums'],
    queryFn: async () => {
      if (!localStorage.getItem(FEATURED_ALBUMS)) {
        await _fetchFeaturedAlbumsAndSetToLocalStorage();
      } else {
        const compareResult = await compareDbUpdatedTime(
          JSON.parse(<string>localStorage.getItem(FEATURED_ALBUMS)).dbUpdatedTime
        );
        if (!compareResult.isLatest) {
          await _fetchFeaturedAlbumsAndSetToLocalStorage(compareResult.dbUpdatedTime);
        }
      }

      return get(
        JSON.parse(localStorage.getItem(FEATURED_ALBUMS) || '{}') as FeaturedAlbums,
        'albums',
        []
      ) as AlbumItem[];
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  });

  return { data, isFetching };
}
