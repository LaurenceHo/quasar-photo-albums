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
    getAnalytics(firebaseApp);

    const store = useStore();
    store.dispatch(ActionType.getAllAlbumList);
    store.dispatch(ActionType.getAlbumTags);
  },
});
</script>
