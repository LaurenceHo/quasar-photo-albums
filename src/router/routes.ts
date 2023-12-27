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
            name: 'Albums',
            component: () => import('pages/AlbumList.vue'),
          },
          {
            path: '/album/:albumId',
            name: 'Photos',
            component: () => import('pages/PhotoList.vue'),
          },
        ],
      },
      {
        path: '/map',
        component: () => import('pages/AlbumMap.vue'),
        name: 'Map',
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
