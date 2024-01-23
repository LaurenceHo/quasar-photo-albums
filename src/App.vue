<template>
  <router-view />
</template>
<script lang="ts" setup>
import 'mapbox-gl/dist/mapbox-gl.css';

document.getElementsByTagName('title')[0].innerHTML = process.env.ALBUM_APP_TITLE as string;
</script>
