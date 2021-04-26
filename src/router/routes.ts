import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('pages/Home.vue'),
    children: [
      {
        path: '',
        name: 'Albums',
        component: () => import('pages/AlbumList.vue'),
      },
      {
        path: '/album/:albumName',
        name: 'Photos',
        component: () => import('pages/PhotoList.vue'),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue'),
  },
];

export default routes;
