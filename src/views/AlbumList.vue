<template>
  <div class="flex flex-wrap justify-between pt-2">
    <div class="flex grow sm:flex-none">
      <Button outlined severity="secondary" @click="toggleSortOrder">
        <template #icon>
          <template v-if="sortOrder === 'asc'">
            <IconSortAscendingLetters :size="24" />
          </template>
          <template v-else>
            <IconSortDescendingLetters :size="24" />
          </template>
        </template>
      </Button>
      <SelectYear
        :selected-year="paramsYear || filteredAlbumsByYear?.year || 'na'"
        extra-class="ml-2 grow sm:w-auto sm:flex-none"
        @select-year="setSelectedYear"
      />
      <SelectTags extra-class="ml-2 grow sm:w-auto sm:flex-none" @select-tags="setSelectedTags" />
    </div>
    <div class="album-list-paginator grow pt-2 sm:flex-none sm:pt-0">
      <Paginator
        v-model:rows="itemsPerPage"
        :rows-per-page-options="[10, 20, 30]"
        :total-records="totalItems"
        @page="onPageChange"
      />
    </div>
  </div>
  <div v-if="isAdmin" class="flex items-center pt-4">
    Only show private album
    <ToggleSwitch v-model="privateOnly" class="ml-2" data-test-id="album-private-toggle" />
  </div>
  <div v-if="isFetchingFeaturedAlbums" class="py-4">
    <Skeleton class="mb-4" height="2rem" width="10rem" />
    <div class="flex">
      <Skeleton :size="isXSmallDevice ? '10rem' : '13rem'" class="mr-4"></Skeleton>
      <Skeleton :size="isXSmallDevice ? '10rem' : '13rem'"></Skeleton>
    </div>
  </div>
  <div v-else-if="featuredAlbums && featuredAlbums.length > 0" class="py-4">
    <h1 class="pb-4 text-3xl font-bold">Featured</h1>
    <Carousel :featured-albums="featuredAlbums" />
  </div>
  <div v-if="isFetchingAlbums" class="grid grid-cols-1 gap-2 pt-4 md:grid-cols-2 xl:grid-cols-3">
    <div
      v-for="n in 3"
      :key="n"
      class="flex h-28 items-center rounded-md border border-gray-300 p-3 sm:h-36"
    >
      <Skeleton :size="isXSmallDevice ? '6rem' : '7rem'" />
      <div class="ml-3 flex-grow">
        <Skeleton class="mb-2" width="10rem" />
        <Skeleton />
      </div>
    </div>
  </div>
  <template v-else>
    <template v-if="chunkAlbumList.length > 0">
      ({{ totalItems }} album{{ totalItems > 1 ? 's' : '' }})
      <div class="grid grid-cols-1 gap-2 pt-2 md:grid-cols-2 xl:grid-cols-3">
        <Album v-for="album in chunkAlbumList" :key="album.id" :album-item="album" />
      </div>
    </template>
    <template v-else>
      <div class="text-xl font-semibold">No results.</div>
    </template>
  </template>
  <ScrollTop />

  <CreateAlbum v-if="updateAlbumDialogState" />
  <CreateAlbumTag v-if="createAlbumTagDialogState" />
  <ShowAlbumTags v-if="showAlbumTagsDialogState" />
</template>

<script lang="ts" setup>
import Album from '@/components/Album.vue';
import Carousel from '@/components/Carousel.vue';
import { CreateAlbum, CreateAlbumTag, ShowAlbumTags } from '@/components/dialog';
import SelectTags from '@/components/select/SelectTags.vue';
import SelectYear from '@/components/select/SelectYear.vue';
import {
  useAlbumFilter,
  useAlbums,
  useDevice,
  useFeaturedAlbums,
  useUserConfig,
} from '@/composables';
import { useDialogStore } from '@/stores';
import { type FilteredAlbumsByYear } from '@/composables/use-albums';
import { FILTERED_ALBUMS_BY_YEAR } from '@/utils/local-storage-key';
import { IconSortAscendingLetters, IconSortDescendingLetters } from '@tabler/icons-vue';
import { storeToRefs } from 'pinia';
import { Button, type PageState, Paginator, ScrollTop, Skeleton, ToggleSwitch } from 'primevue';
import { useToast } from 'primevue/usetoast';
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const toast = useToast();
const route = useRoute();
const router = useRouter();

const { isAdmin } = useUserConfig();
const { isFetchingAlbums, fetchAlbumsByYear } = useAlbums();
const { isFetching: isFetchingFeaturedAlbums, data: featuredAlbums } = useFeaturedAlbums();
const { isXSmallDevice } = useDevice();
const dialogStore = useDialogStore();
const { showAlbumTagsDialogState, updateAlbumDialogState, createAlbumTagDialogState } =
  storeToRefs(dialogStore);

// Pagination state
const pageNumber = ref(1);
const itemsPerPage = ref(20);

// Filter state management
const { filterState, filteredAlbums } = useAlbumFilter();

const sortOrder = computed({
  get: () => filterState.value.sortOrder,
  set: (value: 'asc' | 'desc') => (filterState.value.sortOrder = value),
});

const privateOnly = computed({
  get: () => filterState.value.privateOnly,
  set: (value: boolean) => (filterState.value.privateOnly = value),
});

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc';
};

const paramsYear = computed(() => route.params['year'] as string);
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value));
const firstIndex = computed(() => (pageNumber.value - 1) * itemsPerPage.value);
const lastIndex = computed(() =>
  totalPages.value > pageNumber.value ? firstIndex.value + itemsPerPage.value : totalItems.value,
);
const totalItems = computed(() => filteredAlbums.value.length);
const chunkAlbumList = computed(() =>
  filteredAlbums.value.slice(firstIndex.value, lastIndex.value),
);

const filteredAlbumsByYear: FilteredAlbumsByYear = JSON.parse(
  localStorage.getItem(FILTERED_ALBUMS_BY_YEAR) || '{}',
);

const onPageChange = (event: PageState) => {
  pageNumber.value = event.page + 1;
  itemsPerPage.value = event.rows;
};

const setSelectedTags = (tags: string[]) => {
  filterState.value.selectedTags = tags;
};
const setSelectedYear = (year: string) =>
  router.push({ name: 'albumsByYear', params: { year: year } });

// Fetch all albums and featured albums and store them in the store
fetchAlbumsByYear(paramsYear.value || filteredAlbumsByYear?.year).catch(() => {
  toast.add({
    severity: 'error',
    summary: 'Error',
    detail: 'Error while fetching albums. Please try again later.',
    life: 3000,
  });
});

watch(paramsYear, (newValue) => {
  fetchAlbumsByYear(newValue);
});

watch(isFetchingAlbums, (newValue) => {
  if (!newValue && !paramsYear.value) {
    router.push({ name: 'albumsByYear', params: { year: filteredAlbumsByYear?.year || 'na' } });
  }
});
</script>
