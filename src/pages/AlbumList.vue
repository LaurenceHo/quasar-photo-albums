<template>
  <div class="q-pt-md">
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
      <div class="col-shrink q-mr-sm q-pb-sm">
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
      <div class="col-12 col-xl-1 col-lg-1 col-md-2 col-sm-3 q-mr-sm q-pb-sm">
        <q-select v-model="selectedYear" :options="yearOptions" dense label="Year" outlined />
      </div>
      <div class="col-12 col-xl-3 col-lg-3 col-md-4 col-sm-5 q-pb-sm">
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
      <div class="col-12 col-xl-4 col-lg-5 col-md-5 flex justify-end items-center">
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
      <div class="col-12 col-xl-4 col-lg-5 col-md-5 flex justify-end items-center q-pt-md">
        <Pagination
          :items-per-page-props="itemsPerPage"
          :page-number-props="pageNumber"
          :total-items="totalItems"
          :total-pages="totalPages"
          @set-page-params="setPageParams"
        />
      </div>
    </template>
    <template v-else>
      <div class="text-h5 text-weight-medium">No results.</div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import Album from 'components/Album.vue';
import Pagination from 'components/Pagination.vue';
import { isEmpty } from 'radash';
import { Album as AlbumItem } from 'src/components/models';
import AlbumTagsFilterComposable from 'src/composables/album-tags-filter-composable';
import { albumStore } from 'src/stores/album-store';
import { sortByKey } from 'src/utils/helper';
import { userStore } from 'stores/user-store';
import { computed, onBeforeMount, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const store = albumStore();
const userPermissionStore = userStore();

const { albumTags, filterTags } = AlbumTagsFilterComposable();

const pageNumber = ref(1);
const itemsPerPage = ref(20);
const albumStyle = ref((route.query.albumStyle as string) || 'list'); // List is default style
const totalItems = ref(store.albumList.length);
const chunkAlbumList = ref(store.chunkAlbumList(0, itemsPerPage.value) as AlbumItem[]);
const selectedTags = ref([]);
const privateAlbum = ref(false);
const selectedYear = ref((route.query.year as string) || store.selectedYear || 'n/a');

const isAdminUser = computed(() => userPermissionStore.isAdminUser);
const sortOrder = computed(() => store.sortOrder);
const refreshAlbumList = computed(() => store.refreshAlbumList);
const searchKey = computed(() => store.searchKey);
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value));
const firstIndex = computed(() => (pageNumber.value - 1) * itemsPerPage.value);
const lastIndex = computed(() =>
  totalPages.value > pageNumber.value ? firstIndex.value + itemsPerPage.value : totalItems.value
);
const sortIcon = computed(() =>
  sortOrder.value === 'desc' ? 'mdi-sort-alphabetical-descending' : 'mdi-sort-alphabetical-ascending'
);

onBeforeMount(() => {
  store.getAlbumsByYear(route.query.year as string);
});

const getFilteredAlbumList = () => {
  if (!isEmpty(searchKey.value) || !isEmpty(selectedTags.value) || privateAlbum.value) {
    const filteredAlbumList = store.filteredAlbumList(searchKey.value, selectedTags.value, privateAlbum.value);
    totalItems.value = filteredAlbumList.length;
    chunkAlbumList.value = filteredAlbumList.slice(firstIndex.value, lastIndex.value);
  } else {
    totalItems.value = store.albumList.length;
    chunkAlbumList.value = store.chunkAlbumList(firstIndex.value, lastIndex.value);
  }
};

const setAlbumStyle = (type: 'list' | 'grid') => {
  albumStyle.value = type;
  router.replace({ query: { ...route.query, albumStyle: type } });
};

const setPageParams = (params: { pageNumber: number; itemsPerPage: number }) => {
  pageNumber.value = params.pageNumber;
  itemsPerPage.value = params.itemsPerPage;
};

const updateSortOrder = () => store.$patch({ sortOrder: sortOrder.value === 'desc' ? 'asc' : 'desc' });

const yearOptions = ['n/a'];
const currentYear = new Date().getFullYear();
for (let i = currentYear; 2000 <= i; i--) {
  yearOptions.push(String(i));
}

// Only update the order of album list when user click sort button in order to prevent sorting multiple times
watch(sortOrder, (newValue) => {
  store.setAlbumList(sortByKey(store.albumList, 'albumName', newValue));
  getFilteredAlbumList();
});

watch(refreshAlbumList, (newValue) => {
  if (newValue) {
    getFilteredAlbumList();
    store.updateRefreshAlbumListFlag();
  }
});

watch(selectedYear, (newValue) => {
  if (newValue) {
    store.getAlbumsByYear(newValue);
    router.replace({ query: { ...route.query, year: newValue } });
  }
});

watch([pageNumber, itemsPerPage, searchKey, selectedTags, privateAlbum], () => {
  getFilteredAlbumList();
});
</script>
