import type { Album as AlbumItem, ApiResponse } from '@/schema';
import { AggregateService } from '@/services/aggregate-service';
import { compareDbUpdatedTime, fetchDbUpdatedTime } from '@/utils/helper';
import { ALBUMS_WITH_LOCATION } from '@/utils/local-storage-key';
import { useQuery } from '@tanstack/vue-query';
import DOMPurify from 'dompurify';
import type { Feature, Point } from 'geojson';
import { defineStore } from 'pinia';
import { computed } from 'vue';

interface GeoJson {
  type: 'FeatureCollection';
  features: Feature[];
}

interface AlbumsWithLocation {
  dbUpdatedTime: string;
  albums: AlbumItem[];
}

const _getStoredAlbumLocations = (): AlbumsWithLocation | null => {
  try {
    const stored = localStorage.getItem(ALBUMS_WITH_LOCATION);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const _storeAlbumLocations = (data: AlbumsWithLocation) => {
  localStorage.setItem(ALBUMS_WITH_LOCATION, JSON.stringify(data));
};

const _shouldRefetch = async (): Promise<boolean> => {
  const stored = _getStoredAlbumLocations();
  if (!stored) return true;
  const { isLatest } = await compareDbUpdatedTime(stored.dbUpdatedTime, 'album');
  return !isLatest;
};

/** Get albums with location and set to local storage */
const _fetchAlbumsWithLocationAndSetToLocationStorage = async () => {
  try {
    if (!(await _shouldRefetch())) {
      const albumLocationsWithDBTime = _getStoredAlbumLocations();
      return albumLocationsWithDBTime ? albumLocationsWithDBTime.albums : [];
    }

    const timeJson = await fetchDbUpdatedTime();
    const {
      data: albums,
      code,
      message,
    } = (await AggregateService.getAggregateData('albumsWithLocation')) as ApiResponse<AlbumItem[]>;

    if (code !== 200) {
      console.error('Error fetching album locations:', message);
      return [];
    }

    if (albums) {
      _storeAlbumLocations({ dbUpdatedTime: timeJson?.album || '', albums });

      return albums;
    }

    return [];
  } catch (error) {
    console.error('Error fetching album locations:', error);
    throw error;
  }
};

const cdnURL = import.meta.env.VITE_IMAGEKIT_CDN_URL as string;

export const useAlbumLocationsStore = defineStore('albumLocations', () => {
  const { data, isFetching } = useQuery({
    queryKey: ['albumsWithLocation'],
    queryFn: _fetchAlbumsWithLocationAndSetToLocationStorage,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
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
                coordinates: [longitude, latitude],
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
                    `<a href='/album/${album.year}/${album.id}'>View Album</a>`,
                ),
              },
            };
          })
          .filter(Boolean),
      }) as GeoJson,
  );

  return {
    isFetching,
    albumLocationGeoJson,
  };
});
