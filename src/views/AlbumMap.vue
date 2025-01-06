<template>
  <ProgressBar v-if="isFetching" mode="indeterminate" style="height: 4px"></ProgressBar>
  <div
    id="album-location-map"
    :class="`${isFetching ? 'mt-[72px]' : 'mt-14 md:mt-16'} absolute top-0 bottom-0 left-0 right-0 w-full h-full`"
  ></div>
</template>

<script lang="ts" setup>
import useAlbumLocations from '@/composables/use-album-locations';
import useUserConfig from '@/composables/use-user-config';
import type { Feature, Point } from 'geojson';
import mapboxgl, { type MapEventOf, type SourceSpecification } from 'mapbox-gl';
import ProgressBar from 'primevue/progressbar';
import { onMounted } from 'vue';

const mapCentreLng = Number(import.meta.env.VITE_MAP_CENTRE_LNG ?? 174.7633);
const mapCentreLat = Number(import.meta.env.VITE_MAP_CENTRE_LAT ?? -36.8484);
const { darkMode } = useUserConfig();
const { isFetching, albumLocationGeoJson } = useAlbumLocations();

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
  (map.getSource('albums') as any).getClusterExpansionZoom(clusterId, (err: Error, zoom: number) => {
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
    popupContent.classList.toggle('!bg-zinc-900', darkMode.value);
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
      data: albumLocationGeoJson.value,
      cluster: true,
      clusterMaxZoom: 14, // Max zoom to cluster points on
      clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
    } as SourceSpecification);

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
    map.on('mouseenter', 'unclustered-point', (event: MapEventOf<'mouseenter'>) => {
      createPopup(map, event, popup);
    });

    map.on('mouseleave', 'unclustered-point', () => {
      map.getCanvas().style.cursor = '';
    });

    // When touch moves over a point on the map, open a popup
    map.on('touchstart', 'unclustered-point', (event: MapEventOf<'touchstart'>) => {
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
