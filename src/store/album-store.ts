import { Album } from 'components/models';
import isEmpty from 'lodash/isEmpty';
import { defineStore } from 'pinia';
import { LoadingBar } from 'quasar';
import FirestoreService from 'src/services/firestore-service';
import { userStore } from 'src/store/user-store';

export interface AlbumState {
  loadingAlbums: boolean;
  loadingAlbumTags: boolean;
  allAlbumList: Album[];
  albumTags: string[];
  searchKey: string;
}

const firestoreService = new FirestoreService();

export const albumStore = defineStore('album', {
  state: () =>
    ({
      loadingAlbums: false,
      loadingAlbumTags: false,
      allAlbumList: [],
      albumTags: [],
      searchKey: '',
    } as AlbumState),
  getters: {
    chunkAlbumList:
      (state: AlbumState) =>
      (firstIndex: number, lastIndex: number): Album[] => {
        if (!isEmpty(state.allAlbumList)) {
          return state.allAlbumList.slice(firstIndex, lastIndex);
        } else {
          return [];
        }
      },
    filteredAlbumList:
      (state: AlbumState) =>
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
  },
  actions: {
    setSearchKey(input: string) {
      this.searchKey = input;
    },

    async getAllAlbumList() {
      const userPermissionStore = userStore();

      LoadingBar.start();
      this.loadingAlbums = true;
      this.allAlbumList = await firestoreService.getAlbumList(userPermissionStore.userPermission.role !== 'admin');
      LoadingBar.stop();
      this.loadingAlbums = false;
    },

    async getAlbumTags() {
      this.loadingAlbumTags = true;
      const albumTags = await firestoreService.getAlbumTags();
      this.albumTags = albumTags.tags.sort((a: string, b: string) => {
        if (a.toLowerCase() > b.toLowerCase()) {
          return 1;
        } else if (a.toLowerCase() < b.toLowerCase()) {
          return -1;
        }
        return 0;
      });
      this.loadingAlbumTags = false;
    },
  },
});
