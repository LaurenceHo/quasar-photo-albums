<template>
  <q-layout view="hHh lpR fFf">
    <q-header>
      <q-toolbar>
        <q-avatar>
          <img src="icons/favicon-128x128.png" />
        </q-avatar>
        <q-toolbar-title> {{ albumAppName }}</q-toolbar-title>
        <q-input v-if="routeName === 'Albums'" v-model="searchKey" dense standout="bg-grey">
          <template v-slot:prepend>
            <q-icon name="mdi-magnify" />
          </template>
          <template v-slot:append>
            <q-icon class="cursor-pointer" name="mdi-close" @click="searchKey = ''" />
          </template>
        </q-input>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { useStore } from 'src/store';
import { ActionType } from 'src/store/types';
import { computed, defineComponent, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

export default defineComponent({
  name: 'PublicLayout',

  setup() {
    const store = useStore();
    const route = useRoute();

    const albumAppName = computed(() => process.env.ALBUM_APP_TITLE);
    const searchKey = ref('');
    watch(searchKey, (newValue) => {
      store.dispatch(ActionType.inputSearchKey, newValue);
    });

    return {
      searchKey,
      albumAppName,
      routeName: computed(() => route.name),
    };
  },
});
</script>
