import { getters } from 'src/store/getters';
import { actions } from './actions';
import { mutations } from './mutations';
import { StoreState } from './types';
import { store } from 'quasar/wrappers';
import { InjectionKey } from 'vue';
import { createStore, Store as VuexStore, useStore as vuexUseStore } from 'vuex';

/** Reference: https://soshace.com/building-web-apps-with-vue-3-composition-api-typescript-vuex4-0/ **/

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

const state: StoreState = {
  loadingData: false,
  allAlbumList: [],
  searchKey: '',
};

// provide typings for `this.$store`
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $store: VuexStore<StoreState>;
  }
}

// provide typings for `useStore` helper
export const storeKey: InjectionKey<VuexStore<StoreState>> = Symbol('vuex-key');

export default store(function (/* { ssrContext } */) {
  return createStore<StoreState>({
    state,
    mutations,
    actions,
    getters,
    // enable strict mode (adds overhead!)
    // for dev mode and --debug builds only
    strict: !!process.env.DEBUGGING,
  });
});

export function useStore() {
  return vuexUseStore(storeKey);
}
