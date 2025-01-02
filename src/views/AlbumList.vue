<template>
  <div class="flex justify-between flex-wrap pt-2">
    <div class="flex grow sm:flex-none">
      <Button
        outlined
        severity="secondary"
        @click="() => (albumSortOrder === 'desc' ? (albumSortOrder = 'asc') : (albumSortOrder = 'desc'))"
      >
        <template #icon>
          <template v-if="albumSortOrder === 'asc'">
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
    <div class="album-list-paginator pt-2 sm:pt-0 grow sm:flex-none">
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
    <ToggleSwitch v-model="privateAlbum" class="ml-2" data-test-id="album-private-toggle" />
  </div>
  <div v-if="isFetchingFeaturedAlbums" class="py-4">
    <Skeleton class="mb-4" height="2rem" width="10rem" />
    <div class="flex">
      <Skeleton :size="isXSmallDevice ? '10rem' : '13rem'" class="mr-4"></Skeleton>
      <Skeleton :size="isXSmallDevice ? '10rem' : '13rem'"></Skeleton>
    </div>
  </div>
  <div v-else-if="featuredAlbums && featuredAlbums.length > 0" class="py-4">
    <h1 class="text-3xl font-bold pb-4">Featured</h1>
    <Carousel :featured-albums="featuredAlbums" />
  </div>
  <div v-if="isFetchingAlbums" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 pt-4">
    <div v-for="n in 3" :key="n" class="flex items-center border border-gray-300 p-3 rounded-md h-28 sm:h-36">
      <Skeleton :size="isXSmallDevice ? '6rem' : '7rem'" />
      <div class="flex-grow ml-3">
        <Skeleton class="mb-2" width="10rem" />
        <Skeleton />
      </div>
    </div>
  </div>
  <template v-else>
    <template v-if="chunkAlbumList.length > 0">
      ({{ totalItems }} album{{ totalItems > 1 ? 's' : '' }})
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 pt-2">
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
  <UpdateAlbumTags v-if="updateAlbumTagsDialogState" />

  <Toast position="bottom-center" />
</template>

<script lang="ts" setup>
import Album from '@/components/Album.vue';
import Carousel from '@/components/Carousel.vue';
import { CreateAlbum, UpdateAlbumTags } from '@/components/dialog';
import CreateAlbumTag from '@/components/dialog/CreateAlbumTag.vue';
import SelectTags from '@/components/select/SelectTags.vue';
import SelectYear from '@/components/select/SelectYear.vue';
import useAlbums, { type FilteredAlbumsByYear } from '@/composables/use-albums';
import useDevice from '@/composables/use-device';
import useDialog from '@/composables/use-dialog';
import useUserConfig from '@/composables/use-user-config';
import type { Album as AlbumItem, ApiResponse } from '@/schema';
import { AggregateService } from '@/services/aggregate-service';
import { compareDbUpdatedTime, fetchDbUpdatedTime, sortByKey } from '@/utils/helper';
import { FEATURED_ALBUMS, FILTERED_ALBUMS_BY_YEAR } from '@/utils/local-storage-key';
import { IconSortAscendingLetters, IconSortDescendingLetters } from '@tabler/icons-vue';
import { useQuery } from '@tanstack/vue-query';
import Button from 'primevue/button';
import Paginator from 'primevue/paginator';
import ScrollTop from 'primevue/scrolltop';
import Skeleton from 'primevue/skeleton';
import Toast from 'primevue/toast';
import ToggleSwitch from 'primevue/toggleswitch';
import { useToast } from 'primevue/usetoast';
import { get, isEmpty } from 'radash';
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

interface FeaturedAlbums {
  dbUpdatedTime: string;
  albums: AlbumItem[];
}

const toast = useToast();
const route = useRoute();
const router = useRouter();

const { isAdmin } = useUserConfig();
const { albumSearchKey, albumList, isFetchingAlbums, fetchAlbumsByYear } = useAlbums();
const { isXSmallDevice } = useDevice();
const { updateAlbumTagsDialogState, updateAlbumDialogState, createAlbumTagDialogState } = useDialog();

const pageNumber = ref(1);
const itemsPerPage = ref(20);
const selectedTags = ref<string[]>([]);
const privateAlbum = ref(false);
const albumSortOrder = ref<'desc' | 'asc'>('desc');
const filteredAlbumList = ref(albumList.value);

const paramsYear = computed(() => route.params['year'] as string);
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value));
const firstIndex = computed(() => (pageNumber.value - 1) * itemsPerPage.value);
const lastIndex = computed(() =>
  totalPages.value > pageNumber.value ? firstIndex.value + itemsPerPage.value : totalItems.value
);
const totalItems = computed(() => filteredAlbumList.value.length);
const chunkAlbumList = computed(() => {
  if (!isEmpty(albumSearchKey.value) || !isEmpty(selectedTags.value) || privateAlbum.value) {
    return filteredAlbumList.value.slice(firstIndex.value, lastIndex.value);
  } else {
    return albumList.value.slice(firstIndex.value, lastIndex.value);
  }
});

const filteredAlbumsByYear: FilteredAlbumsByYear = JSON.parse(<string>localStorage.getItem(FILTERED_ALBUMS_BY_YEAR));

const onPageChange = (event: any) => {
  pageNumber.value = event.page + 1;
  itemsPerPage.value = event.rows;
};

const setSelectedTags = (tags: string[]) => {
  selectedTags.value = tags;
};
const setSelectedYear = (year: string) => router.push({ name: 'albumsByYear', params: { year: year } });

// Fetch all albums and featured albums and store them in the store
fetchAlbumsByYear(paramsYear.value || filteredAlbumsByYear?.year).catch(() => {
  toast.add({
    severity: 'error',
    summary: 'Error',
    detail: 'Error while fetching albums. Please try again later.',
    life: 3000
  });
});

/** Get featured albums and set to local storage **/
const fetchFeaturedAlbumsAndSetToLocalStorage = async (dbUpdatedTime?: string) => {
  let time = dbUpdatedTime;
  if (!time) {
    time = await fetchDbUpdatedTime();
  }

  const {
    data: albums,
    code,
    message
  } = (await AggregateService.getAggregateData('featuredAlbums')) as ApiResponse<AlbumItem[]>;
  if (code !== 200) {
    throw Error(message);
  }

  if (albums) {
    localStorage.setItem(
      FEATURED_ALBUMS,
      JSON.stringify({
        dbUpdatedTime: time,
        albums
      } as FeaturedAlbums)
    );
  }
};

const { data: featuredAlbums, isFetching: isFetchingFeaturedAlbums } = useQuery({
  queryKey: ['featuredAlbums'],
  queryFn: async () => {
    if (!localStorage.getItem(FEATURED_ALBUMS)) {
      await fetchFeaturedAlbumsAndSetToLocalStorage();
    } else {
      const compareResult = await compareDbUpdatedTime(
        JSON.parse(<string>localStorage.getItem(FEATURED_ALBUMS)).dbUpdatedTime
      );
      if (!compareResult.isLatest) {
        await fetchFeaturedAlbumsAndSetToLocalStorage(compareResult.dbUpdatedTime);
      }
    }

    return get(
      JSON.parse(localStorage.getItem(FEATURED_ALBUMS) || '{}') as FeaturedAlbums,
      'albums',
      []
    ) as AlbumItem[];
  },
  refetchOnWindowFocus: false,
  refetchOnReconnect: false
});

watch(albumList, (newValue) => {
  filteredAlbumList.value = sortByKey(newValue, 'albumName', albumSortOrder.value);
});

watch(
  [albumSortOrder, albumSearchKey, privateAlbum, selectedTags],
  ([newSortOrder, newSearchKey, newPrivateAlbum, newSelectedTags]) => {
    if (!albumList.value.length) return;

    let filteredList = albumList.value;

    if (newPrivateAlbum) {
      filteredList = filteredList.filter((album) => album.isPrivate);
    }
    if (newSearchKey) {
      const lowerSearchKey = newSearchKey.toLowerCase();
      filteredList = filteredList.filter(
        (album) =>
          album.albumName.toLowerCase().includes(lowerSearchKey) ||
          album.description?.toLowerCase().includes(lowerSearchKey)
      );
    }
    if (newSelectedTags && newSelectedTags.length > 0) {
      const filterByTags: AlbumItem[] = [];

      filteredList.forEach((album) => {
        const result = newSelectedTags.some((tag) => album.tags?.includes(tag));
        if (result) {
          filterByTags.push(album);
        }
      });
      filteredList = filterByTags;
    }
    filteredAlbumList.value = sortByKey(filteredList, 'albumName', newSortOrder);
  }
);

watch(paramsYear, (newValue) => {
  fetchAlbumsByYear(newValue);
});

watch(isFetchingAlbums, (newValue) => {
  if (!newValue && !paramsYear.value) {
    router.push({ name: 'albumsByYear', params: { year: filteredAlbumsByYear?.year || 'na' } });
  }
});
</script>
