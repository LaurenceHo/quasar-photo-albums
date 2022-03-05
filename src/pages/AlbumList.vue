<template>
  <q-page class="q-pt-md">
    <div class="q-pb-md row justify-between items-center content-center">
      <div class="col-shrink q-mr-sm">
        <q-btn-group outline>
          <q-btn
            :outline="albumStyle === 'grid'"
            color="primary"
            dense
            icon="mdi-format-list-bulleted-square"
            @click="setAlbumStyle('list')"
          />
          <q-btn
            :outline="albumStyle === 'list'"
            color="primary"
            dense
            icon="mdi-view-grid"
            @click="setAlbumStyle('grid')"
          />
        </q-btn-group>
      </div>
      <div class="col-12 col-xl-3 col-lg-3 col-md-4">
        <q-select
          v-model="selectedTags"
          :options="albumTags"
          clearable
          dense
          input-debounce="0"
          label="Category"
          multiple
          outlined
          use-chips
          use-input
          @filter="filterTags"
        />
      </div>
      <q-space />
      <div class="col-12 col-xl-4 col-lg-5 col-md-5 flex justify-end items-center">
        <q-pagination
          v-model="pageNumber"
          :max="totalPages"
          :max-pages="5"
          boundary-links
          boundary-numbers
          direction-links
          outline
        />
        <q-select v-model="itemsPerPage" :options="[10, 20, 50]" dense outlined />
        ({{ totalItems }} albums)
      </div>
    </div>
    <template v-if="chunkAlbumList.length">
      <div v-if="albumStyle === 'grid'" class="q-col-gutter-md row">
        <Album v-for="album in chunkAlbumList" :key="album.id" :albumItem="album" :albumStyle="albumStyle" />
      </div>
      <div v-else class="justify-center row">
        <div class="col-12 col-xl-6 col-lg-8 col-md-8 column">
          <q-list bordered class="rounded-borders" separator>
            <Album v-for="album in chunkAlbumList" :key="album.id" :albumItem="album" :albumStyle="albumStyle" />
          </q-list>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="text-h5 text-weight-medium">No results.</div>
    </template>
  </q-page>
</template>

<script lang="ts" setup>
import Album from 'components/Album.vue';
import { Album as AlbumItem } from 'components/models';
import isEmpty from 'lodash/isEmpty';
import AlbumTagsFilterComposable from 'src/composables/album-tags-filter-composable';
import { albumStore } from 'src/store/album-store';
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const store = albumStore();

const { albumTags, filterTags } = AlbumTagsFilterComposable();

const itemsPerPage = ref(20);
const pageNumber = ref(1);
const albumStyle = ref((route.query.albumStyle as string) || 'list');
const totalItems = ref(store.allAlbumList.length);
const chunkAlbumList = ref(store.chunkAlbumList(0, itemsPerPage.value) as AlbumItem[]);
const selectedTags = ref([]);

const refreshAlbumList = computed(() => store.refreshAlbumList);
const searchKey = computed(() => store.searchKey);
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value));
const firstIndex = computed(() => (pageNumber.value - 1) * itemsPerPage.value);
const lastIndex = computed(() =>
  totalPages.value > pageNumber.value ? firstIndex.value + itemsPerPage.value : totalItems.value
);

const getFilteredAlbumList = () => {
  if (!isEmpty(searchKey.value) || !isEmpty(selectedTags.value)) {
    const filteredAlbumList = store.filteredAlbumList(searchKey.value, selectedTags.value);
    totalItems.value = filteredAlbumList.length;
    chunkAlbumList.value = filteredAlbumList.slice(firstIndex.value, lastIndex.value);
  } else {
    totalItems.value = store.allAlbumList.length;
    chunkAlbumList.value = store.chunkAlbumList(firstIndex.value, lastIndex.value);
  }
};

const setAlbumStyle = (type: 'list' | 'grid') => {
  albumStyle.value = type;
  router.replace({ query: { albumStyle: type } });
};

watch(refreshAlbumList, (newValue) => {
  if (newValue) {
    getFilteredAlbumList();
    store.updateRefreshAlbumListFlag();
  }
});

watch([pageNumber, itemsPerPage, searchKey, selectedTags], ([newPageNumber]) => {
  if (!newPageNumber) {
    pageNumber.value = 1;
  }
  getFilteredAlbumList();
});
</script>
