<template>
  <div id="album-location-map" class="rounded-borders-lg"></div>
</template>

<script setup lang="ts">
import mapboxgl from 'mapbox-gl';
import { onMounted, toRefs } from 'vue';

onMounted(() => {
  mapboxgl.accessToken = process.env.MAPBOX_API_KEY as string;
  const map = new mapboxgl.Map({
    container: 'album-location-map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [174.763336, -36.848461],
    zoom: 8,
  });

  map.on('idle', () => {
    map.resize();
  });
});
</script>

<style scoped lang="scss">
#album-location-map {
  width: 100%;
  height: 500px;
}
</style>
