<template>
  <q-page class="q-pt-md">
    <div class="q-pb-md row justify-between items-center content-center">
      <div class="col-shrink q-mr-sm">
        <q-btn-group outline>
          <q-btn
            :outline="albumListType === 'square'"
            color="primary"
            dense
            icon="mdi-format-list-bulleted-square"
            @click="setAlbumListType('list')"
          />
          <q-btn
            :outline="albumListType === 'list'"
            color="primary"
            dense
            icon="mdi-view-grid"
            @click="setAlbumListType('square')"
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
          @filter="filterCategory"
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
      <div v-if="albumListType === 'square'" class="q-col-gutter-md row">
        <Album v-for="album in chunkAlbumList" :key="album.albumName" :albumItem="album" :albumType="albumListType" />
      </div>
      <div v-else class="justify-center row">
        <div class="col-12 col-xl-6 col-lg-8 col-md-8 column">
          <q-list bordered class="rounded-borders" separator>
            <Album
              v-for="album in chunkAlbumList"
              :key="album.albumName"
              :albumItem="album"
              :albumType="albumListType"
            />
          </q-list>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="text-h5 text-weight-medium">No results.</div>
    </template>
  </q-page>
</template>

<script lang="ts">
import Album from 'components/Album.vue';
import { Album as AlbumItem } from 'components/models';
import isEmpty from 'lodash/isEmpty';
import { useStore } from 'src/store';
import { computed, defineComponent, ref, watch } from 'vue';

export default defineComponent({
  name: 'AlbumList',

  components: {
    Album,
  },

  setup() {
    const store = useStore();
    const itemsPerPage = ref(20);
    const pageNumber = ref(1);
    const albumListType = ref('list');
    const totalItems = ref(store.state.allAlbumList.length);
    const chunkAlbumList = ref(store.getters.chunkAlbumList(0, itemsPerPage.value) as AlbumItem[]);
    const albumTags = ref(store.state.albumTags);
    const selectedTags = ref([]);

    const searchKey = computed(() => store.state.searchKey);
    const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value));
    const firstIndex = computed(() => (pageNumber.value - 1) * itemsPerPage.value);
    const lastIndex = computed(() =>
      totalPages.value > pageNumber.value ? firstIndex.value + itemsPerPage.value : totalItems.value
    );

    const getFilteredAlbumList = () => {
      if (!isEmpty(searchKey.value) || !isEmpty(selectedTags.value)) {
        const filteredAlbumList = store.getters.filteredAlbumList(searchKey.value, selectedTags.value);
        totalItems.value = filteredAlbumList.length;
        chunkAlbumList.value = filteredAlbumList.slice(firstIndex.value, lastIndex.value);
      } else {
        totalItems.value = store.state.allAlbumList.length;
        chunkAlbumList.value = store.getters.chunkAlbumList(firstIndex.value, lastIndex.value);
      }
    };

    watch(pageNumber, () => {
      getFilteredAlbumList();
    });

    watch(itemsPerPage, () => {
      pageNumber.value = 1;
      getFilteredAlbumList();
    });

    watch(searchKey, () => {
      pageNumber.value = 1;
      getFilteredAlbumList();
    });

    watch(selectedTags, () => {
      pageNumber.value = 1;
      getFilteredAlbumList();
    });
    return {
      store,
      searchKey,
      pageNumber,
      totalItems,
      totalPages,
      itemsPerPage,
      chunkAlbumList,
      albumListType,
      setAlbumListType: (type: 'list' | 'square') => (albumListType.value = type),
      albumTags,
      selectedTags,
      filterCategory: (val: string, update: any) => {
        if (val === '') {
          update(() => {
            albumTags.value = store.state.albumTags;
          });
          return;
        }

        update(() => {
          const needle = val.toLowerCase();
          albumTags.value = store.state.albumTags.filter((v) => v.toLowerCase().indexOf(needle) > -1);
        });
      },
    };
  },
});
</script>
