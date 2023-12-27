<template>
  <div id="album-location-map" class="rounded-borders-lg"></div>
</template>

<script setup lang="ts">
import { Album as AlbumItem } from 'components/models';
import mapboxgl from 'mapbox-gl';
import { albumStore } from 'stores/album-store';
import { computed, onMounted, ref } from 'vue';

const store = albumStore();
const filteredAlbumList = ref(store.allAlbumList as AlbumItem[]);
const geoJson = computed(() => {
  const geoJson = {
    type: 'FeatureCollection',
    features: [] as any[],
  } as any;

  for (const album of filteredAlbumList.value) {
    if (album.place?.location.latitude && album.place.location.longitude) {
      geoJson.features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [album.place.location.longitude, album.place.location.latitude],
        },
        properties: {
          name: album.albumName,
          description: `<strong>${album.place.displayName}</strong><br/>`,
          icon: 'marker',
        },
      });
    }
  }

  return geoJson;
});

onMounted(() => {
  mapboxgl.accessToken = process.env.MAPBOX_API_KEY as string;
  const map = new mapboxgl.Map({
    container: 'album-location-map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [174.763336, -36.848461],
    zoom: 5,
  });

  map.on('idle', () => {
    map.resize();
  });

  for (const marker of geoJson.value.features) {
    new mapboxgl.Marker().setLngLat(marker.geometry.coordinates).addTo(map);
  }

  map.on('load', () => {
    map.addSource('albums', {
      type: 'geojson',
      data: geoJson.value,
    });

    // Create a popup, but don't add it to the map yet.
    const popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
    });

    // When mouse moves over a point on the map, open a popup at the
    // location of the feature, with description HTML from its properties.
    map.on('mouseenter', 'albums', (event: any) => {
      console.log('event', event);
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
    });

    map.on('mouseleave', 'albums', () => {
      map.getCanvas().style.cursor = '';
      popup.remove();
    });
  });
});
</script>

<style scoped lang="scss">
#album-location-map {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
}
</style>
