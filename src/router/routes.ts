import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/PublicLayout.vue'),
    children: [
      {
        path: '/',
        component: () => import('pages/Index.vue'),
        name: 'LandingPage',
        redirect: '/albums',
        children: [
          {
            path: '/albums',
            name: 'DefaultAlbums',
            component: () => import('pages/AlbumList.vue'),
          },
          {
            path: '/albums/:year',
            name: 'AlbumsByYear',
            component: () => import('pages/AlbumList.vue'),
          },
          {
            path: '/album/:year/:albumId',
            name: 'Photos',
            component: () => import('pages/PhotoList.vue'),
          },
        ],
      },
      {
        path: '/map/albums',
        component: () => import('pages/AlbumMap.vue'),
        name: 'AlbumMap',
      },
      {
        path: '/login',
        component: () => import('pages/Login.vue'),
        name: 'Login',
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
