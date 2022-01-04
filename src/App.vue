<template>
  <router-view />
</template>
<script lang="ts" setup>
import { firebaseApp } from 'boot/firebase';
import { getAnalytics } from 'firebase/analytics';

document.getElementsByTagName('title')[0].innerHTML = process.env.ALBUM_APP_TITLE as string;
getAnalytics(firebaseApp);
</script>
