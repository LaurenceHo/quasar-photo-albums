<template>
  <div v-if="!loadingAllAlbumInformation" class="q-pt-md">
    <div class="q-pb-md row justify-between items-center content-center">
      <div class="col-shrink q-mr-sm q-pb-sm">
        <q-btn-group outline>
          <q-btn
            :outline="albumStyle === 'grid'"
            color="primary"
            data-test-id="album-list-style-button"
            dense
            icon="mdi-format-list-bulleted-square"
            padding="sm"
            @click="setAlbumStyle('list')"
          />
          <q-btn
            :outline="albumStyle === 'list'"
            color="primary"
            data-test-id="album-grid-style-button"
            dense
            icon="mdi-view-grid"
            padding="sm"
            @click="setAlbumStyle('grid')"
          />
        </q-btn-group>
      </div>
      <div class="col-shrink q-mr-sm-sm q-mr-xs-none q-pb-sm">
        <q-btn
          :icon="sortIcon"
          color="primary"
          data-test-id="album-sort-order-button"
          dense
          outline
          padding="sm"
          @click="updateSortOrder"
        />
      </div>
      <div class="col-12 col-xl-1 col-lg-1 col-md-2 col-sm-2 q-mr-sm q-pb-sm">
        <select-year :selected-year="paramsYear || filteredAlbumsByYear?.year || 'na'" @select-year="setSelectedYear" />
      </div>
      <div class="col-12 col-xl-3 col-lg-3 col-md-3 col-sm-grow q-pb-sm">
        <q-select
          v-model="selectedTags"
          :options="albumTags"
          clearable
          dense
          emit-value
          input-debounce="0"
          label="Category"
          multiple
          option-label="tag"
          option-value="tag"
          outlined
          use-chips
          use-input
          @filter="filterTags"
        />
      </div>
      <q-space />
      <div
        class="col-12 col-xl-4 col-lg-4 col-md-4 col-sm-grow flex items-center"
        :class="$q.screen.lt.md ? 'justify-center' : 'justify-end'"
      >
        <Pagination
          :items-per-page-props="itemsPerPage"
          :page-number-props="pageNumber"
          :total-items="totalItems"
          :total-pages="totalPages"
          @set-page-params="setPageParams"
        />
      </div>
    </div>
    <q-toggle
      v-if="isAdminUser"
      v-model="privateAlbum"
      data-test-id="album-private-toggle"
      checked-icon="mdi-lock"
      color="primary"
      icon="mdi-lock-open"
      label="Only show private album"
      left-label
    />
    <template v-if="chunkAlbumList.length > 0">
      <div v-if="albumStyle === 'grid'" class="q-col-gutter-md row">
        <Album v-for="album in chunkAlbumList" :key="album.id" :album-item="album" :album-style="albumStyle" />
      </div>
      <div v-else :class="`row ${$q.screen.lt.xl ? 'justify-center' : ''}`">
        <Album v-for="album in chunkAlbumList" :key="album.id" :album-item="album" :album-style="albumStyle" />
      </div>
    </template>
    <template v-else>
      <div class="text-h5 text-weight-medium">No results.</div>
    </template>
    <ScrollToTopButton />
  </div>
  <template v-else>
    <skeleton-album-list />
  </template>
</template>

<script lang="ts" setup>
import Album from 'components/Album.vue';
import ScrollToTopButton from 'components/button/ScrollToTopButton.vue';
import Pagination from 'components/Pagination.vue';
import SelectYear from 'components/SelectYear.vue';
import SkeletonAlbumList from 'pages/SkeletonAlbumList.vue';
import { isEmpty } from 'radash';
import AlbumTagsFilterComposable from 'src/composables/album-tags-filter-composable';
import { albumStore, FILTERED_ALBUMS_BY_YEAR, FilteredAlbumsByYear } from 'src/stores/album-store';
import { userStore } from 'stores/user-store';
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { LocalStorage } from 'quasar';

const route = useRoute();
const router = useRouter();
const useAlbumStore = albumStore();
const userPermissionStore = userStore();

const { albumTags, filterTags } = AlbumTagsFilterComposable();

const paramsYear = computed(() => route.params['year'] as string);

const pageNumber = ref(1);
const itemsPerPage = ref(20);
const albumStyle = ref((route.query['albumStyle'] as string) || 'list'); // List is default style
const selectedTags = ref([]);
const privateAlbum = ref(false);

const isAdminUser = computed(() => userPermissionStore.isAdminUser);
const loadingAllAlbumInformation = computed(() => useAlbumStore.loadingAllAlbumInformation);
const sortOrder = computed(() => useAlbumStore.sortOrder);
const searchKey = computed(() => useAlbumStore.searchKey);
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value));
const firstIndex = computed(() => (pageNumber.value - 1) * itemsPerPage.value);
const lastIndex = computed(() =>
  totalPages.value > pageNumber.value ? firstIndex.value + itemsPerPage.value : totalItems.value
);
const sortIcon = computed(() =>
  sortOrder.value === 'desc' ? 'mdi-sort-alphabetical-descending' : 'mdi-sort-alphabetical-ascending'
);
const filteredAlbumList = computed(() =>
  useAlbumStore.filteredAlbumList(searchKey.value, selectedTags.value, privateAlbum.value)
);
const totalItems = computed(() => filteredAlbumList.value.length);
const chunkAlbumList = computed(() => {
  if (!isEmpty(searchKey.value) || !isEmpty(selectedTags.value) || privateAlbum.value) {
    return filteredAlbumList.value.slice(firstIndex.value, lastIndex.value);
  } else {
    return useAlbumStore.chunkAlbumList(firstIndex.value, lastIndex.value);
  }
});

const filteredAlbumsByYear: FilteredAlbumsByYear = JSON.parse(<string>LocalStorage.getItem(FILTERED_ALBUMS_BY_YEAR));

const setAlbumStyle = (type: 'list' | 'grid') => {
  albumStyle.value = type;
  router.replace({ query: { ...route.query, albumStyle: type } });
};

const setPageParams = (params: { pageNumber: number; itemsPerPage: number }) => {
  pageNumber.value = params.pageNumber;
  itemsPerPage.value = params.itemsPerPage;
};

const setSelectedYear = (year: string) => router.push({ name: 'AlbumsByYear', params: { year: year } });

const updateSortOrder = () => useAlbumStore.$patch({ sortOrder: sortOrder.value === 'desc' ? 'asc' : 'desc' });

useAlbumStore.getAlbumsByYear(paramsYear.value || filteredAlbumsByYear?.year);

// Only update the order of album list when user click sort button in order to prevent sorting multiple times
watch(sortOrder, (newValue) => {
  useAlbumStore.sortByKey(newValue);
});

watch(paramsYear, (newValue) => {
  useAlbumStore.getAlbumsByYear(newValue);
});

watch(loadingAllAlbumInformation, (newValue) => {
  if (!newValue && !paramsYear.value) {
    router.push({ name: 'AlbumsByYear', params: { year: filteredAlbumsByYear?.year || 'na' } });
  }
});
</script>
