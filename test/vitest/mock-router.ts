import { createRouter, createWebHistory } from 'vue-router';
import routes from '../../src/router/routes';

export const mockRouter = createRouter({
  routes,
  history: createWebHistory(),
});
