import { Album } from 'components/models';
import { GetterTree } from 'vuex';
import { Getters, StoreState } from 'src/store/types';
import isEmpty from 'lodash/isEmpty';

export const getters: GetterTree<StoreState, StoreState> & Getters = {
  chunkAlbumList: (state: StoreState) => (firstIndex: number, lastIndex: number): Album[] => {
    if (!isEmpty(state.allAlbumList)) {
      return state.allAlbumList.slice(firstIndex, lastIndex);
    } else {
      return [];
    }
  },
  filteredAlbumList: (state: StoreState) => (searchKey: string): Album[] => {
    if (searchKey) {
      return state.allAlbumList.filter((album) => album.albumName.toLowerCase().includes(searchKey.toLowerCase()));
    } else {
      return state.allAlbumList;
    }
  },
};
