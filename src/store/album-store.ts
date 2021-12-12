import { Album } from 'components/models';
import isEmpty from 'lodash/isEmpty';
import { defineStore } from 'pinia';
import { Notify } from 'quasar';
import FirestoreService from 'src/services/firestore-service';

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

    getAllAlbumList() {
      this.loadingAlbums = true;

      firestoreService
        .getAlbumList()
        .then((albumList) => {
          this.allAlbumList = albumList;
        })
        .catch((error) => {
          Notify.create({
            color: 'error',
            textColor: 'white',
            icon: 'mdi-alert-circle-outline',
            message: error.toString(),
          });
        })
        .finally(() => {
          this.loadingAlbums = false;
        });
    },

    getAlbumTags() {
      this.loadingAlbumTags = true;

      firestoreService
        .getAlbumTags()
        .then((albumTags) => {
          this.albumTags = albumTags.tags.sort((a: string, b: string) => {
            if (a.toLowerCase() > b.toLowerCase()) {
              return 1;
            } else if (a.toLowerCase() < b.toLowerCase()) {
              return -1;
            }
            return 0;
          });
        })
        .catch((error) => {
          Notify.create({
            color: 'error',
            textColor: 'white',
            icon: 'mdi-alert-circle-outline',
            message: error.toString(),
          });
        })
        .finally(() => {
          this.loadingAlbumTags = false;
        });
    },
  },
});
