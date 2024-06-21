<template>
  <router-view />
</template>
<script lang="ts" setup>
import 'mapbox-gl/dist/mapbox-gl.css';
const title = document.getElementsByTagName('title')?.[0];
if (title) {
  title.innerHTML = process.env['ALBUM_APP_TITLE'] as string;
}
</script>
