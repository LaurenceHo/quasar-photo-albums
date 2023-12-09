<template>
  <div id="photo-location-map" class="rounded-borders-lg"></div>
</template>

<script lang="ts" setup>
import mapboxgl from 'mapbox-gl';
import { computed, onMounted, toRefs } from 'vue';

const props = defineProps({
  latitude: {
    type: Number,
    default: () => 0,
  },
  longitude: {
    type: Number,
    default: () => 0,
  },
  latitudeRef: {
    type: String,
    default: () => 'N',
  },
  longitudeRef: {
    type: String,
    default: () => 'E',
  },
});

const { latitude, longitude, latitudeRef, longitudeRef } = toRefs(props);
const internalLatitude = computed(() => (latitudeRef.value !== 'N' ? latitude.value * -1 : latitude.value));
const internalLongitude = computed(() => (longitudeRef.value !== 'E' ? longitude.value * -1 : longitude.value));

onMounted(() => {
  mapboxgl.accessToken = process.env.MAPBOX_API_KEY as string;
  const map = new mapboxgl.Map({
    container: 'photo-location-map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [internalLongitude.value, internalLatitude.value],
    zoom: 10,
  });

  // Create a default Marker and add it to the map.
  new mapboxgl.Marker().setLngLat([internalLongitude.value as number, internalLatitude.value as number]).addTo(map);
});
</script>
<style lang="scss">
#photo-location-map {
  width: 100%;
  height: 300px;

  canvas.mapboxgl-canvas {
    width: 100% !important;
  }
}
</style>
