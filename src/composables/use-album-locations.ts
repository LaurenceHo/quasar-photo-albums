import type { Album, Album as AlbumItem, ApiResponse } from '@/schema';
import { AggregateService } from '@/services/aggregate-service';
import { compareDbUpdatedTime, fetchDbUpdatedTime } from '@/utils/helper';
import { ALBUMS_WITH_LOCATION } from '@/utils/local-storage-key';
import { useQuery } from '@tanstack/vue-query';
import DOMPurify from 'dompurify';
import type { Feature, Point } from 'geojson';
import { get } from 'radash';
import { computed } from 'vue';

interface GeoJson {
  type: 'FeatureCollection';
  features: Feature[];
}

interface AlbumsWithLocation {
  dbUpdatedTime: string;
  albums: AlbumItem[];
}

/** Get albums with location and set to local storage */
const _fetchAlbumsWithLocationAndSetToLocationStorage = async (dbUpdatedTime?: string) => {
  const timestamp = dbUpdatedTime || (await fetchDbUpdatedTime());

  const {
    data: albums,
    code,
    message
  } = (await AggregateService.getAggregateData('albumsWithLocation')) as ApiResponse<AlbumItem[]>;

  if (code !== 200) {
    throw Error(message);
  }

  if (albums) {
    localStorage.setItem(
      ALBUMS_WITH_LOCATION,
      JSON.stringify({ dbUpdatedTime: timestamp, albums } as AlbumsWithLocation)
    );
  }
};

const cdnURL = import.meta.env.VITE_IMAGEKIT_CDN_URL as string;

export default function useAlbumLocations() {
  const { data, isFetching } = useQuery({
    queryKey: ['albumsWithLocation'],
    queryFn: async () => {
      if (!localStorage.getItem(ALBUMS_WITH_LOCATION)) {
        await _fetchAlbumsWithLocationAndSetToLocationStorage();
      } else {
        const compareResult = await compareDbUpdatedTime(
          JSON.parse(<string>localStorage.getItem(ALBUMS_WITH_LOCATION)).dbUpdatedTime
        );
        if (!compareResult.isLatest) {
          await _fetchAlbumsWithLocationAndSetToLocationStorage(compareResult.dbUpdatedTime);
        }
      }

      return get(
        JSON.parse(localStorage.getItem(ALBUMS_WITH_LOCATION) || '{}') as AlbumsWithLocation,
        'albums',
        []
      ) as Album[];
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  });

  const albumLocationGeoJson = computed(
    () =>
      ({
        type: 'FeatureCollection',
        features: data.value
          ?.map((album: AlbumItem) => {
            const longitude = album.place?.location?.longitude;
            const latitude = album.place?.location?.latitude;

            if (!longitude || !latitude) {
              return null;
            }

            return {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [longitude, latitude]
              } as Point,
              properties: {
                name: album.albumName,
                description: DOMPurify.sanitize(
                  `<strong>${album.albumName}</strong><br/>` +
                    `${album.place?.displayName ? `<div>${album.place?.displayName}</div>` : ''}` +
                    `${
                      album.albumCover
                        ? `<img src='${cdnURL}/${encodeURI(album.albumCover + '?tr=w-280' || '')}' alt='${album.albumName}' />`
                        : ''
                    }` +
                    `${album.description ? `<p>${album.description}</p>` : ''}` +
                    `<a href='/album/${album.year}/${album.id}'>View Album</a>`
                )
              }
            };
          })
          .filter(Boolean)
      }) as GeoJson
  );

  return {
    isFetching,
    albumLocationGeoJson
  };
}
