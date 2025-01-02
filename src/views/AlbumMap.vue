<template>
  <ProgressBar v-if="isFetching" mode="indeterminate" style="height: 4px"></ProgressBar>
  <div
    id="album-location-map"
    :class="`${isFetching ? 'mt-[72px]' : 'mt-16'} absolute top-0 bottom-0 left-0 right-0 w-full`"
  ></div>
</template>

<script lang="ts" setup>
import useUserConfig from '@/composables/use-user-config';
import type { Album, Album as AlbumItem, ApiResponse } from '@/schema';
import { AggregateService } from '@/services/aggregate-service';
import { compareDbUpdatedTime, fetchDbUpdatedTime } from '@/utils/helper';
import { ALBUMS_WITH_LOCATION } from '@/utils/local-storage-key';
import { useQuery } from '@tanstack/vue-query';
import type { Feature, Point } from 'geojson';
import mapboxgl from 'mapbox-gl';
import ProgressBar from 'primevue/progressbar';
import { get } from 'radash';
import { computed, onMounted } from 'vue';

interface GeoJson {
  type: 'FeatureCollection';
  features: Feature[];
}

interface AlbumsWithLocation {
  dbUpdatedTime: string;
  albums: AlbumItem[];
}

const cdnURL = import.meta.env.VITE_IMAGEKIT_CDN_URL as string;
const mapCentreLng = Number(import.meta.env.VITE_MAP_CENTRE_LNG ?? 174.7633);
const mapCentreLat = Number(import.meta.env.VITE_MAP_CENTRE_LAT ?? -36.8484);
const { darkMode } = useUserConfig();

const geoJson = computed(
  () =>
    ({
      type: 'FeatureCollection',
      features: albumsWithLocation.value?.map((album: AlbumItem) => {
        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [album.place?.location.longitude, album.place?.location.latitude]
          } as Point,
          properties: {
            name: album.albumName,
            description:
              `<strong>${album.albumName}</strong><br/>` +
              `${album.place?.displayName ? `<div>${album.place?.displayName}</div>` : ''}` +
              `${
                album.albumCover
                  ? `<img src='${cdnURL}/${encodeURI(album.albumCover + '?tr=w-280' || '')}' alt='${album.albumName}' />`
                  : ''
              }` +
              `${album.description ? `<p>${album.description}</p>` : ''}` +
              `<a href='/album/${album.year}/${album.id}'>View Album</a>`
          }
        };
      })
    }) as GeoJson
);

/** Get albums with location and set to local storage */
const fetchAlbumsWithLocation = async (dbUpdatedTime?: string) => {
  let time = dbUpdatedTime;
  if (!time) {
    time = await fetchDbUpdatedTime();
  }

  const {
    data: albums,
    code,
    message
  } = (await AggregateService.getAggregateData('albumsWithLocation')) as ApiResponse<AlbumItem[]>;

  if (code !== 200) {
    throw Error(message);
  }

  if (albums) {
    localStorage.setItem(ALBUMS_WITH_LOCATION, JSON.stringify({ dbUpdatedTime: time, albums } as AlbumsWithLocation));
  }
};

const { data: albumsWithLocation, isFetching } = useQuery({
  queryKey: ['albumsWithLocation'],
  queryFn: async () => {
    if (!localStorage.getItem(ALBUMS_WITH_LOCATION)) {
      await fetchAlbumsWithLocation();
    } else {
      const compareResult = await compareDbUpdatedTime(
        JSON.parse(<string>localStorage.getItem(ALBUMS_WITH_LOCATION)).dbUpdatedTime
      );
      if (!compareResult.isLatest) {
        await fetchAlbumsWithLocation(compareResult.dbUpdatedTime);
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

const inspectCluster = (
  map: mapboxgl.Map,
  e: (mapboxgl.MapMouseEvent | mapboxgl.MapTouchEvent) & {
    features?: mapboxgl.GeoJSONFeature[] | undefined;
  }
) => {
  const features: Feature[] = map.queryRenderedFeatures(e.point, {
    layers: ['clusters']
  });
  const clusterId = features[0]?.properties?.['cluster_id'];
  (map.getSource('albums') as any).getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
    if (err) return;

    map.easeTo({
      center: (features[0]?.geometry as Point).coordinates as [number, number],
      zoom: zoom
    });
  });
};

const createPopup = (map: mapboxgl.Map, event: any, popup: mapboxgl.Popup) => {
  // Change the cursor style as a UI indicator.
  map.getCanvas().style.cursor = 'pointer';

  const coordinates = event.features[0].geometry.coordinates.slice();
  const description = event.features[0].properties.description;
  // Ensure that if the map is zoomed out such that multiple
  // copies of the feature are visible, the popup appears
  // over the copy being pointed to.
  while (Math.abs(event.lngLat.lng - coordinates[0]) > 180) {
    coordinates[0] += event.lngLat.lng > coordinates[0] ? 360 : -360;
  }

  // Populate the popup and set its coordinates
  // based on the feature found.
  popup.setLngLat(coordinates).setHTML(description).addTo(map);

  // Change the background if it's dark mode
  const popupContent = document.querySelector('.mapboxgl-popup-content');
  if (popupContent) {
    popupContent.classList.toggle('bg-zinc-900', darkMode.value);
  }
};

onMounted(async () => {
  mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API_KEY as string;
  const map = new mapboxgl.Map({
    container: 'album-location-map',
    style: 'mapbox://styles/mapbox/standard',
    center: [mapCentreLng, mapCentreLat],
    zoom: 4
  });

  map.on('idle', () => {
    map.resize();
  });

  map.on('load', () => {
    map.addSource('albums', {
      type: 'geojson',
      data: geoJson.value,
      cluster: true,
      clusterMaxZoom: 14, // Max zoom to cluster points on
      clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
    } as any);

    map.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'albums',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': '#637A90',
        'circle-radius': 20
      }
    });

    map.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'albums',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': ['get', 'point_count_abbreviated'],
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12
      },
      paint: {
        'text-color': 'white'
      }
    });

    // Load custom marker image
    map.loadImage('/marker-icon.png', (error, image) => {
      if (error) throw error;
      // Add the image to the map style.
      map.addImage('custom-marker', image as ImageBitmap);

      // Add a layer to use the image to represent the data.
      map.addLayer({
        id: 'unclustered-point',
        type: 'symbol',
        source: 'albums',
        filter: ['!', ['has', 'point_count']],
        layout: {
          'icon-image': 'custom-marker', // reference the image
          'icon-size': 0.25
        }
      });
    });

    // Inspect a cluster on mouse event
    map.on('click', 'clusters', (e) => {
      inspectCluster(map, e);
    });

    map.on('mouseenter', 'clusters', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'clusters', () => {
      map.getCanvas().style.cursor = '';
    });

    // Inspect a cluster on touch event
    map.on('touchstart', 'clusters', (e) => {
      inspectCluster(map, e);
    });

    // Create a popup, but don't add it to the map yet.
    const popup = new mapboxgl.Popup();

    // When mouse moves over a point on the map, open a popup at the
    // location of the feature, with description HTML from its properties.
    map.on('mouseenter', 'unclustered-point', (event: any) => {
      createPopup(map, event, popup);
    });

    map.on('mouseleave', 'unclustered-point', () => {
      map.getCanvas().style.cursor = '';
    });

    // When touch moves over a point on the map, open a popup
    map.on('touchstart', 'unclustered-point', (event: any) => {
      createPopup(map, event, popup);
    });
  });
});
</script>

<style lang="scss">
.mapboxgl-popup {
  max-width: 320px !important;
}

.mapboxgl-popup-content {
  text-align: center;
  padding: 1rem;

  img {
    padding-top: 10px;
    width: 280px;
  }
}

.mapboxgl-marker {
  cursor: pointer;
}
</style>
