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
        <template v-if="!loadingAllAlbumInformation">
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
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const useAlbumStore = albumStore();
const route = useRoute();

const loadingAllAlbumInformation = computed(() => useAlbumStore.loadingAllAlbumInformation);
const selectedAlbumItem = computed(() => useAlbumStore.selectedAlbumItem);

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
