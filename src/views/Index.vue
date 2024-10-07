<template>
  <main class="mt-2 mb-10 max-w-screen-2xl mx-auto">
    <div id="container" class="px-8 sm:px-4">
      <Breadcrumb
        :model="breadcrumbs"
        :pt="{
          root: {
            style: {
              paddingRight: '0',
              paddingLeft: '0'
            }
          }
        }"
      >
        <template #item="{ item }">
          <div class="flex items-center min-w-0">
            <component :is="item.icon" :size="20" />
            <span class="ml-2 truncate max-w-[160px] sm:max-w-full">{{ item.label }}</span>
          </div>
        </template>
      </Breadcrumb>

      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </div>
  </main>
</template>

<script lang="ts" setup>
import AlbumsContext from '@/composables/albums-context';
import { IconFolders, IconLibraryPhoto } from '@tabler/icons-vue';
import Breadcrumb from 'primevue/breadcrumb';
import { computed, type FunctionalComponent } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const { currentAlbum } = AlbumsContext();

const breadcrumbs = computed((): { label: string }[] => {
  const routes: { label: string; icon: FunctionalComponent }[] = [];
  routes.push({ label: 'Albums', icon: IconFolders });
  if (route.name === 'photosByAlbum') {
    routes.push({
      label: currentAlbum.value.albumName,
      icon: IconLibraryPhoto
    });
  }
  return routes;
});
</script>
