import { Mutations, MutationType, StoreState } from './types';
import { MutationTree } from 'vuex';

export const mutations: MutationTree<StoreState> & Mutations = {
  [MutationType.loadingData](state: StoreState, payload): void {
    state.loadingData = payload;
  },
  [MutationType.setAllAlbumList](state: StoreState, payload): void {
    state.allAlbumList = payload;
  },
  [MutationType.inputSearchKey](state: StoreState, payload): void {
    state.searchKey = payload;
  },
};
