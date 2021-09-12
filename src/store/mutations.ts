import { Mutations, MutationType, StoreState } from './types';
import { MutationTree } from 'vuex';

export const mutations: MutationTree<StoreState> & Mutations = {
  [MutationType.loadingAlbum](state: StoreState, payload): void {
    state.loadingAlbum = payload;
  },
  [MutationType.loadingAlbumTags](state: StoreState, payload): void {
    state.loadingAlbumTags = payload;
  },
  [MutationType.setAllAlbumList](state: StoreState, payload): void {
    state.allAlbumList = payload;
  },
  [MutationType.setAlbumTags](state: StoreState, payload): void {
    state.albumTags = payload;
  },
  [MutationType.inputSearchKey](state: StoreState, payload): void {
    state.searchKey = payload;
  },
};
