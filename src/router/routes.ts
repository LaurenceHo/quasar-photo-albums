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
    ],
  },
  {
    path: '/',
    component: () => import('layouts/AdminLayout.vue'),
    children: [
      {
        path: '/login',
        component: () => import('pages/Login.vue'),
        name: 'Login',
      },
      {
        path: '/management',
        component: () => import('pages/Index.vue'),
        name: 'Management',
        meta: { requiresAuth: true },
        children: [
          {
            path: '',
            name: 'Albums',
            component: () => import('pages/AlbumList.vue'),
          },
          {
            path: '/management/album/:albumName',
            name: 'Photos',
            component: () => import('pages/PhotoList.vue'),
          },
        ],
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
