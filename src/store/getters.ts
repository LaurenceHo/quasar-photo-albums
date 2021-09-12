import { Album } from 'components/models';
import isEmpty from 'lodash/isEmpty';
import { Getters, StoreState } from 'src/store/types';
import { GetterTree } from 'vuex';

export const getters: GetterTree<StoreState, StoreState> & Getters = {
  chunkAlbumList:
    (state: StoreState) =>
    (firstIndex: number, lastIndex: number): Album[] => {
      if (!isEmpty(state.allAlbumList)) {
        return state.allAlbumList.slice(firstIndex, lastIndex);
      } else {
        return [];
      }
    },
  filteredAlbumList:
    (state: StoreState) =>
    (searchKey: string, selectedTags: string[]): Album[] => {
      let filteredAlbumList = state.allAlbumList;
      if (!isEmpty(searchKey) || !isEmpty(selectedTags)) {
        const filterByTags: Album[] = [];
        if (!isEmpty(searchKey)) {
          filteredAlbumList = filteredAlbumList.filter(
            (album) =>
              album.albumName.toLowerCase().includes(searchKey.toLowerCase()) ||
              album.desc.toLowerCase().includes(searchKey.toLowerCase())
          );
        }
        if (!isEmpty(selectedTags)) {
          filteredAlbumList.forEach((album) => {
            const result = selectedTags.some((tag) => album.tags.includes(tag));
            if (result) {
              filterByTags.push(album);
            }
          });
          filteredAlbumList = filterByTags;
        }
      }
      return filteredAlbumList;
    },
};
