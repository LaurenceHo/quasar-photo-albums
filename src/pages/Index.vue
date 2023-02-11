<template>
  <q-page>
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
        <template v-if="!loadingAlbums">
          <router-view v-slot="{ Component }">
            <keep-alive>
              <component :is="Component" />
            </keep-alive>
          </router-view>
        </template>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { albumStore } from 'src/stores/album-store';
import { photoStore } from 'stores/photo-store';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const store = albumStore();
const usePhotoStore = photoStore();
const route = useRoute();

const loadingAlbums = computed(() => store.loadingAlbums);
const selectedAlbumItem = computed(() => usePhotoStore.selectedAlbumItem);

const breadcrumbs = computed((): { label: string; icon: string; to?: any }[] => {
  const routes: { label: string; icon: string; to?: any }[] = [];
  routes.push({ label: 'Home', icon: 'mdi-home' });
  routes.push({ label: 'Albums', icon: 'mdi-apps', to: { name: 'Albums' } });
  if (route.name === 'Photos') {
    routes.push({ label: 'Photos', icon: 'mdi-image-multiple' });
  }
  if (route.name === 'Photo') {
    routes.push({ label: 'Photos', icon: 'mdi-image-multiple', to: { path: `/album/${selectedAlbumItem.value.id}` } });
    routes.push({ label: 'Photo', icon: 'mdi-image' });
  }
  return routes;
});

store.getAlbums();
store.getAlbumTags();
</script>
