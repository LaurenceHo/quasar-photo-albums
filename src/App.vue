<template>
  <router-view />
</template>
<script lang="ts">
import { useStore } from 'src/store';
import { ActionType } from 'src/store/types';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'App',

  setup() {
    const store = useStore();
    store.dispatch(ActionType.getAllAlbumList);
    store.dispatch(ActionType.getAlbumTags);
  },
});
</script>
