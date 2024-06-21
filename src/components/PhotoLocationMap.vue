<template>
  <div id="photo-location-map" class="rounded-borders-lg" :style="`width: ${width}; height: ${height};`"></div>
</template>

<script lang="ts" setup>
import mapboxgl from 'mapbox-gl';
import { onMounted, onUnmounted, toRefs } from 'vue';

const props = defineProps({
  latitude: {
    type: Number,
    default: () => 0,
  },
  longitude: {
    type: Number,
    default: () => 0,
  },
  width: {
    type: String,
    default: () => '100%',
  },
  height: {
    type: String,
    default: () => '300px',
  },
});

const { latitude, longitude, width, height } = toRefs(props);

let map: mapboxgl.Map;
onMounted(() => {
  mapboxgl.accessToken = process.env['MAPBOX_API_KEY'] as string;
  const container = document.getElementById('photo-location-map');

  if (container) {
    map = new mapboxgl.Map({
      container: 'photo-location-map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [longitude.value, latitude.value],
      zoom: 11,
    });

    // Create a default Marker and add it to the map.
    new mapboxgl.Marker().setLngLat([longitude.value as number, latitude.value as number]).addTo(map);

    map.on('idle', () => {
      map.resize();
    });
  }
});

onUnmounted(() => {
  if (map) {
    map.remove();
  }
});
</script>
