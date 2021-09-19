import routes from 'src/router/routes';
import { createRouter, createWebHistory } from 'vue-router';
import { createStore } from 'vuex';

const mockAlbumList = [
  { albumName: 'Sport', desc: 'Sport', tags: ['sport'], private: false },
  { albumName: 'Food', desc: 'Food', tags: ['food'], private: false },
  { albumName: 'Hiking', desc: 'Hiking', tags: ['hiking'], private: false },
  { albumName: 'Shoes', desc: 'Shoes', tags: [], private: false },
  { albumName: 'Do something secret', desc: 'Do something secret', tags: ['secret'], private: true },
];

export const mockStore = createStore({
  state: {
    loadingAlbum: false,
    loadingAlbumTags: false,
    allAlbumList: mockAlbumList,
    albumTags: ['sport', 'food', 'hiking', 'secret'],
    searchKey: '',
  },
  getters: {
    chunkAlbumList: () => () => mockAlbumList,
    filteredAlbumList: () => () => mockAlbumList,
  },
});

export const mockRouter = createRouter({
  routes,
  history: createWebHistory(),
});
