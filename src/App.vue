<template>
  <router-view />
</template>
<script lang="ts">
import { useStore } from 'src/store';
import { ActionType } from 'src/store/types';
import { defineComponent } from 'vue';
import { firebaseApp } from 'boot/firebase';
import { getAnalytics } from 'firebase/analytics';

export default defineComponent({
  name: 'App',

  setup() {
    document.getElementsByTagName('title')[0].innerHTML = process.env.ALBUM_APP_TITLE as string;
    getAnalytics(firebaseApp);

    const store = useStore();
    store.dispatch(ActionType.getAllAlbumList);
    store.dispatch(ActionType.getAlbumTags);
  },
});
</script>
