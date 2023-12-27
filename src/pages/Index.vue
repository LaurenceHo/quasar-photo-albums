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
import { photoStore } from 'stores/photo-store';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const usePhotoStore = photoStore();
const route = useRoute();

const selectedAlbumItem = computed(() => usePhotoStore.selectedAlbumItem);

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
