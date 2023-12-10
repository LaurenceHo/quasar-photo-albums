<template>
  <div id="photo-location-map" class="rounded-borders-lg"></div>
</template>

<script lang="ts" setup>
import mapboxgl from 'mapbox-gl';
import { onMounted, toRefs } from 'vue';

const props = defineProps({
  latitude: {
    type: Number,
    default: () => 0,
  },
  longitude: {
    type: Number,
    default: () => 0,
  },
});

const { latitude, longitude } = toRefs(props);

onMounted(() => {
  mapboxgl.accessToken = process.env.MAPBOX_API_KEY as string;
  const map = new mapboxgl.Map({
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
});
</script>
<style lang="scss">
#photo-location-map {
  width: 100%;
  height: 300px;
}
</style>
