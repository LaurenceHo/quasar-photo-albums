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
import { useStore } from 'src/store';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'AlbumList',

  components: {
    Album,
  },

  data() {
    const store = useStore();
    const itemsPerPage = 10;
    const totalItems = store.state.allAlbumList.length;
    const chunkAlbumList: AlbumName[] = store.getters.chunkAlbumList(0, itemsPerPage);

    return {
      store,
      searchKey: '',
      pageNumber: 1,
      totalItems,
      itemsPerPage,
      chunkAlbumList,
    };
  },

  watch: {
    pageNumber() {
      this.getFilteredAlbumList();
    },

    itemsPerPage() {
      this.pageNumber = 1;
      this.getFilteredAlbumList();
    },

    searchKey() {
      this.pageNumber = 1;
      this.itemsPerPage = 10;
      this.getFilteredAlbumList();
    },
  },

  computed: {
    totalPages(): number {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },

    firstIndex(): number {
      return (this.pageNumber - 1) * this.itemsPerPage;
    },

    lastIndex(): number {
      return this.totalPages > this.pageNumber ? this.firstIndex + this.itemsPerPage : this.totalItems;
    },
  },

  methods: {
    getFilteredAlbumList() {
      if (this.searchKey) {
        const filteredAlbumList = this.store.getters.filteredAlbumList(this.searchKey);
        this.totalItems = filteredAlbumList.length;
        if (filteredAlbumList.length) {
          this.chunkAlbumList = filteredAlbumList.slice(this.firstIndex, this.lastIndex);
        }
      } else {
        this.totalItems = this.store.state.allAlbumList.length;
        this.chunkAlbumList = this.store.getters.chunkAlbumList(this.firstIndex, this.lastIndex);
      }
    },
  },
});
</script>
