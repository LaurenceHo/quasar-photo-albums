<template>
  <router-view />
</template>
<script lang="ts">
// import { insertDataToFirestore } from 'components/helper';
import { useStore } from 'src/store';
import { ActionType } from 'src/store/types';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'App',

  setup() {
    const store = useStore();
    // insertDataToFirestore();
    store.dispatch(ActionType.getAllAlbumList);
    store.dispatch(ActionType.getAlbumTags);
  },
});
</script>
