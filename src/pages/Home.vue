<template>
  <q-layout view="lHh Lpr lFf">
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
      <q-linear-progress v-if="loadingAlbum" color="secondary" query />
      <div class="container">
        <div class="q-pa-md">
          <q-breadcrumbs>
            <q-breadcrumbs-el
              v-for="breadcrumb in breadcrumbs"
              :key="breadcrumb.label"
              :icon="breadcrumb.icon"
              :label="breadcrumb.label"
              :to="breadcrumb.to"
            />
          </q-breadcrumbs>
          <template v-if="!loadingAlbum">
            <router-view v-slot="{ Component }">
              <keep-alive>
                <component :is="Component" />
              </keep-alive>
            </router-view>
          </template>
        </div>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import AlbumList from 'pages/AlbumList.vue';
import PhotoList from 'pages/PhotoList.vue';
import { useStore } from 'src/store';
import { ActionType } from 'src/store/types';
import { computed, defineComponent, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

export default defineComponent({
  name: 'Home',
  components: { PhotoList, AlbumList },
  setup() {
    const store = useStore();
    const route = useRoute();

    const albumAppName = computed(() => process.env.ALBUM_APP_TITLE);
    const loadingAlbum = computed(() => store.state.loadingAlbum);
    const breadcrumbs = computed((): { label: string; icon: string; to?: any }[] => {
      const routes: { label: string; icon: string; to?: any }[] = [];
      routes.push({ label: 'Home', icon: 'mdi-home' });
      routes.push({ label: 'Albums', icon: 'mdi-apps', to: { name: 'Albums' } });
      if (route.name === 'Photos') {
        routes.push({ label: 'Photos', icon: 'mdi-image' });
      }
      return routes;
    });

    const searchKey = ref('');
    watch(searchKey, (newValue) => {
      store.dispatch(ActionType.inputSearchKey, newValue);
    });

    return {
      searchKey,
      loadingAlbum,
      breadcrumbs,
      albumAppName,
      routeName: computed(() => route.name),
    };
  },
});
</script>
