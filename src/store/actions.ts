import { getAlbumList } from 'components/helper';
import { ActionTree } from 'vuex';
import { Actions, ActionType, MutationType, StoreState } from './types';

export const actions: ActionTree<StoreState, StoreState> & Actions = {
  [ActionType.loadingData]({ commit }, payload) {
    commit(MutationType.loadingData, payload);
  },

  [ActionType.getAllAlbumList]({ commit }) {
    let allAlbumList: any[] = [];
    commit(MutationType.loadingData, true);
    getAlbumList().then((albumList) => {
      allAlbumList = albumList;

      commit(MutationType.setAllAlbumList, allAlbumList);
      commit(MutationType.loadingData, false);
    });
  },
};
