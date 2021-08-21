import { getAlbumList } from 'components/helper';
import { Notify } from 'quasar';
import { ActionTree } from 'vuex';
import { Actions, ActionType, MutationType, StoreState } from './types';

export const actions: ActionTree<StoreState, StoreState> & Actions = {
  [ActionType.loadingData]({ commit }, payload) {
    commit(MutationType.loadingData, payload);
  },

  [ActionType.getAllAlbumList]({ commit }) {
    let allAlbumList: any[] = [];
    commit(MutationType.loadingData, true);
    getAlbumList()
      .then((albumList) => {
        allAlbumList = albumList;

        commit(MutationType.setAllAlbumList, allAlbumList);
        commit(MutationType.loadingData, false);
      })
      .catch((error) => {
        console.error(error);
        Notify.create({
          color: 'red-4',
          textColor: 'white',
          icon: 'mdi-alert-circle-outline',
          message: error.toString(),
        });
        commit(MutationType.loadingData, false);
      });
  },

  [ActionType.inputSearchKey]({ commit }, payload) {
    commit(MutationType.inputSearchKey, payload);
  },
};
