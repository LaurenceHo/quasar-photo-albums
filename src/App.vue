<template>
  <router-view />
</template>
<script lang="ts" setup>
import { getAnalytics } from 'firebase/analytics';
import { firebaseApp } from 'src/boot/firebase';

document.getElementsByTagName('title')[0].innerHTML = process.env.ALBUM_APP_TITLE as string;
getAnalytics(firebaseApp);
</script>
