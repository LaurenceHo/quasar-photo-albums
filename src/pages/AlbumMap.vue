<template>
  <div id="album-location-map"></div>
</template>

<script lang="ts" setup>
import { Album as AlbumItem, AlbumTag } from 'components/models';
import mapboxgl from 'mapbox-gl';
import { albumStore } from 'stores/album-store';
import { computed, onMounted, ref } from 'vue';
import { LocalStorage } from 'quasar';
import LocationService from 'src/services/location-service';
import { compareDbUpdatedTime, getStaticFileUrl } from 'src/utils/helper';
import { Feature, Point } from 'geojson';
import { get } from 'radash';

interface GeoJson {
  type: 'FeatureCollection';
  features: Feature[];
}
interface AlbumsWithLocation {
  dbUpdatedTime: string;
  albums: AlbumItem[];
}

const locationService = new LocationService();

const cdnURL = process.env.IMAGEKIT_CDN_URL as string;
const mapCentreLng = Number(process.env.MAP_CENTRE_LNG ?? 174.7633);
const mapCentreLat = Number(process.env.MAP_CENTRE_LAT ?? -36.8484);

const store = albumStore();
const albumsWithLocation = ref<AlbumItem[]>([]);
const isFetching = ref(false);

const albumsHaveLocationFromStore = computed(() => store.albumsHaveLocation);
const geoJson = computed(
  () =>
    ({
      type: 'FeatureCollection',
      features: albumsWithLocation.value.map((album: AlbumItem) => {
        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [album.place?.location.longitude, album.place?.location.latitude],
          } as Point,
          properties: {
            name: album.albumName,
            description:
              `<strong>${album.albumName}</strong><br/>` +
              `${album.place?.displayName ? `<div>${album.place?.displayName}</div>` : ''}` +
              `${
                album.albumCover
                  ? `<img src='${cdnURL}/${encodeURI(album.albumCover + '?tr=w-280' ?? '')}' alt='${album.albumName}' />`
                  : ''
              }` +
              `${album.description ? `<p>${album.description}</p>` : ''}` +
              `<a href='/album/${album.year}/${album.id}'>View Album</a>`,
          },
        };
      }),
    }) as GeoJson
);

const fetchAlbumsWithLocation = async (dbUpdatedTime?: string) => {
  let time = dbUpdatedTime;
  if (!time) {
    const response = await fetch(getStaticFileUrl('updateDatabaseAt.json'));
    const dbUpdatedTimeJSON = await response.json();
    time = dbUpdatedTimeJSON.time;
  }

  const result = await locationService.getAlbumsWithLocation();
  if ((get(result, 'data') as AlbumItem[]).length > 0) {
    LocalStorage.set(
      'ALBUMS_WITH_LOCATION',
      JSON.stringify({ dbUpdatedTime: time, albums: result.data } as AlbumsWithLocation)
    );
  }
};

const inspectCluster = (
  map: mapboxgl.Map,
  e: (mapboxgl.MapMouseEvent | mapboxgl.MapTouchEvent) & {
    features?: mapboxgl.MapboxGeoJSONFeature[] | undefined;
  } & mapboxgl.EventData
) => {
  const features: Feature[] = map.queryRenderedFeatures(e.point, {
    layers: ['clusters'],
  });
  const clusterId = features[0]?.properties?.cluster_id;
  (map.getSource('albums') as any).getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
    if (err) return;

    map.easeTo({
      center: (features[0]?.geometry as Point).coordinates as [number, number],
      zoom: zoom,
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
};

onMounted(async () => {
  isFetching.value = true;
  if (!LocalStorage.getItem('ALBUMS_WITH_LOCATION')) {
    await fetchAlbumsWithLocation();
  } else {
    const compareResult = await compareDbUpdatedTime(
      JSON.parse(<string>LocalStorage.getItem('ALBUMS_WITH_LOCATION')).dbUpdatedTime
    );
    if (!compareResult.isLatest) {
      await fetchAlbumsWithLocation(compareResult.dbUpdatedTime);
    }
  }
  isFetching.value = false;

  const albumsStringFromLocalStorage: string = LocalStorage.getItem('ALBUMS_WITH_LOCATION') || '';

  albumsWithLocation.value =
    get(JSON.parse(albumsStringFromLocalStorage), 'albums', albumsHaveLocationFromStore.value) || [];

  mapboxgl.accessToken = process.env.MAPBOX_API_KEY as string;
  const map = new mapboxgl.Map({
    container: 'album-location-map',
    style: 'mapbox://styles/mapbox/standard',
    center: [mapCentreLng, mapCentreLat],
    zoom: 4,
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
      clusterRadius: 50, // Radius of each cluster when clustering points (defaults to 50)
    } as any);

    map.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'albums',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': '#637A90',
        'circle-radius': 20,
      },
    });

    map.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'albums',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': ['get', 'point_count_abbreviated'],
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12,
      },
      paint: {
        'text-color': 'white',
      },
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
          'icon-size': 0.25,
        },
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
#album-location-map {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
}

.mapboxgl-popup {
  max-width: 300px !important;
}

.mapboxgl-popup-content {
  text-align: center;
  padding: 10px;

  img {
    padding-top: 10px;
    width: 280px;
  }
}

.mapboxgl-marker {
  cursor: pointer;
}
</style>
