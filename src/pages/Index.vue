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
import { albumStore } from 'src/store/album-store';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const store = albumStore();
const route = useRoute();

const loadingAlbums = computed(() => store.loadingAlbums);
const breadcrumbs = computed((): { label: string; icon: string; to?: any }[] => {
  const routes: { label: string; icon: string; to?: any }[] = [];
  routes.push({ label: 'Home', icon: 'mdi-home' });
  routes.push({ label: 'Albums', icon: 'mdi-apps', to: { name: 'Albums' } });
  if (route.name === 'Photos') {
    routes.push({ label: 'Photos', icon: 'mdi-image' });
  }
  return routes;
});
</script>
