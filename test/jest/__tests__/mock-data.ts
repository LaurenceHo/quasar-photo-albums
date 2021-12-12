import routes from 'src/router/routes';
import { createRouter, createWebHistory } from 'vue-router';

export const mockAlbumList = [
  { albumName: 'Sport', desc: 'Sport', tags: ['sport'], private: false },
  { albumName: 'Food', desc: 'Food', tags: ['food'], private: false },
  { albumName: 'Hiking', desc: 'Hiking', tags: ['hiking'], private: false },
  { albumName: 'Shoes', desc: 'Shoes', tags: [], private: false },
  { albumName: 'Do something secret', desc: 'Do something secret', tags: ['secret'], private: true },
];

export const mockRouter = createRouter({
  routes,
  history: createWebHistory(),
});
