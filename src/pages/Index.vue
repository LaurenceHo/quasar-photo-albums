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
        <template v-if="!loadingAllAlbumInformation && !fetchingPhotos">
          <router-view v-slot="{ Component }">
            <keep-alive>
              <component :is="Component" />
            </keep-alive>
          </router-view>
        </template>
        <template v-else>
          <template v-if="route.name === 'Albums'">
            <skeleton-album-list />
          </template>
          <template v-else-if="route.name === 'Photos'">
            <skeleton-photo-list />
          </template>
        </template>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import SkeletonAlbumList from 'pages/SkeletonAlbumList.vue';
import SkeletonPhotoList from 'pages/SkeletonPhotoList.vue';
import { albumStore } from 'src/stores/album-store';
import { photoStore } from 'stores/photo-store';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const useAlbumStore = albumStore();
const usePhotoStore = photoStore();
const route = useRoute();

const loadingAllAlbumInformation = computed(() => useAlbumStore.loadingAllAlbumInformation);
const selectedAlbumItem = computed(() => useAlbumStore.selectedAlbumItem);
const fetchingPhotos = computed(() => usePhotoStore.fetchingPhotos);

const breadcrumbs = computed((): { label: string; icon: string; to?: any }[] => {
  const routes: { label: string; icon: string; to?: any }[] = [];
  routes.push({ label: 'Home', icon: 'mdi-home' });
  routes.push({ label: 'Albums', icon: 'mdi-apps', to: { name: 'Albums' } });
  if (route.name === 'Photos') {
    routes.push({
      label: selectedAlbumItem.value.albumName,
      icon: 'mdi-image-multiple',
    });
  }
  return routes;
});
</script>
