<template>
  <q-page class="q-pt-md">
    <div class="q-pb-md row justify-between items-center">
      <q-input v-model="searchKey" dense outlined>
        <template v-slot:append>
          <q-icon name="mdi-magnify" />
        </template>
      </q-input>
      <div class="row items-center">
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
    <div class="q-col-gutter-md row items-start">
      <Album v-for="album in chunkAlbumList" :key="album.albumName" :album-name="album.albumName" />
    </div>
  </q-page>
</template>

<script lang="ts">
import Album from 'components/Album.vue';
import { Album as AlbumName } from 'components/models';
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
    const searchKey = ref('');

    const totalItems = ref(store.state.allAlbumList.length);
    const chunkAlbumList = ref(store.getters.chunkAlbumList(0, itemsPerPage.value) as AlbumName[]);
    const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value));
    const firstIndex = computed(() => (pageNumber.value - 1) * itemsPerPage.value);
    const lastIndex = computed(() =>
      totalPages.value > pageNumber.value ? firstIndex.value + itemsPerPage.value : totalItems.value
    );

    const getFilteredAlbumList = () => {
      if (!isEmpty(searchKey.value)) {
        const filteredAlbumList = store.getters.filteredAlbumList(searchKey.value);
        totalItems.value = filteredAlbumList.length;
        if (filteredAlbumList.length) {
          chunkAlbumList.value = filteredAlbumList.slice(firstIndex.value, lastIndex.value);
        }
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
      itemsPerPage.value = 10;
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
    };
  },
});
</script>
