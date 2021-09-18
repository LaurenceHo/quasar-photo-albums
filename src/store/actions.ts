import { getAlbumList, getAlbumTags } from 'components/helper';
import { Notify } from 'quasar';
import { ActionTree } from 'vuex';
import { Actions, ActionType, MutationType, StoreState } from './types';

export const actions: ActionTree<StoreState, StoreState> & Actions = {
  [ActionType.loadingAlbum]({ commit }, payload) {
    commit(MutationType.loadingAlbum, payload);
  },

  [ActionType.loadingAlbumTags]({ commit }, payload) {
    commit(MutationType.loadingAlbumTags, payload);
  },

  [ActionType.getAllAlbumList]({ commit }) {
    let allAlbumList: any[] = [];
    commit(MutationType.loadingAlbum, true);
    getAlbumList()
      .then((albumList) => {
        allAlbumList = albumList;

        commit(MutationType.setAllAlbumList, allAlbumList);
        commit(MutationType.loadingAlbum, false);
      })
      .catch((error) => {
        Notify.create({
          color: 'red-4',
          textColor: 'white',
          icon: 'mdi-alert-circle-outline',
          message: error.toString(),
        });
        commit(MutationType.loadingAlbum, false);
      });
  },

  [ActionType.getAlbumTags]({ commit }) {
    commit(MutationType.loadingAlbumTags, true);
    getAlbumTags()
      .then((albumTags) => {
        commit(
          MutationType.setAlbumTags,
          albumTags.tags.sort((a: string, b: string) => {
            if (a.toLowerCase() > b.toLowerCase()) {
              return 1;
            } else if (a.toLowerCase() < b.toLowerCase()) {
              return -1;
            }
            return 0;
          })
        );
        commit(MutationType.loadingAlbumTags, false);
      })
      .catch((error) => {
        Notify.create({
          color: 'red-4',
          textColor: 'white',
          icon: 'mdi-alert-circle-outline',
          message: error.toString(),
        });
        commit(MutationType.loadingAlbumTags, false);
      });
  },

  [ActionType.inputSearchKey]({ commit }, payload) {
    commit(MutationType.inputSearchKey, payload);
  },
};
