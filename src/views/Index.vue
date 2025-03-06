<template>
  <main class="mx-auto mt-2 mb-10 max-w-screen-2xl">
    <div id="container" class="px-8 sm:px-4">
      <Breadcrumb :model="breadcrumbs" class="!px-0">
        <template #item="{ item }">
          <div class="flex min-w-0 items-center">
            <component :is="item.icon" :size="20" />
            <span class="ml-2 max-w-[160px] truncate sm:max-w-full">{{ item.label }}</span>
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
import useAlbums from '@/composables/use-albums';
import { IconFolders, IconLibraryPhoto } from '@tabler/icons-vue';
import Breadcrumb from 'primevue/breadcrumb';
import { computed, type FunctionalComponent } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const { currentAlbum } = useAlbums();

const breadcrumbs = computed((): { label: string }[] => {
  const routes: { label: string; icon: FunctionalComponent }[] = [];
  routes.push({ label: 'Albums', icon: IconFolders });
  if (route.name === 'photosByAlbum') {
    routes.push({
      label: currentAlbum.value.albumName,
      icon: IconLibraryPhoto,
    });
  }
  return routes;
});
</script>
