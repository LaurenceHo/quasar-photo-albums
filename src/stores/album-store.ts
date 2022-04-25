import isEmpty from 'lodash/isEmpty';
import { defineStore } from 'pinia';
import { Loading, Notify } from 'quasar';
import { Album, AlbumTag } from 'src/components/models';
import AlbumService from 'src/services/album-service';
import AlbumTagService from 'src/services/album-tag-service';

export interface AlbumState {
  loadingAlbums: boolean;
  loadingAlbumTags: boolean;
  allAlbumList: Album[];
  albumTags: AlbumTag[];
  searchKey: string;
  refreshAlbumList: boolean;
}

const albumService = new AlbumService();
const albumTagService = new AlbumTagService();

export const albumStore = defineStore('album', {
  state: () =>
    ({
      loadingAlbums: false,
      loadingAlbumTags: false,
      allAlbumList: [],
      albumTags: [],
      searchKey: '',
      refreshAlbumList: false,
    } as AlbumState),
  getters: {
    getAlbumById: (state: AlbumState) => (id: string) => state.allAlbumList.find((album) => album.id === id),

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
              const result = selectedTags.some((tag) => album.tags?.includes(tag));
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

    async getAlbums(startIndex?: number, endIndex?: number, filter?: string) {
      if (this.allAlbumList.length === 0) {
        Loading.show();
        this.loadingAlbums = true;
        try {
          this.allAlbumList = await albumService.getAlbums(startIndex, endIndex, filter);
        } catch (error: any) {
          Notify.create({
            color: 'negative',
            icon: 'mdi-alert-circle',
            message: error.toString(),
          });
        } finally {
          Loading.hide();
          this.loadingAlbums = false;
        }
      }
    },

    async getAlbumTags() {
      if (this.albumTags.length === 0) {
        this.loadingAlbumTags = true;
        try {
          this.albumTags = await albumTagService.getAlbumTags();
        } catch (error: any) {
          Notify.create({
            color: 'negative',
            icon: 'mdi-alert-circle',
            message: error.toString(),
          });
        } finally {
          this.loadingAlbumTags = false;
        }
      }
    },

    updateAlbum(albumToBeUpdated: Album, deleteAlbum: boolean) {
      const findIndex = this.allAlbumList.findIndex((album) => album.id === albumToBeUpdated.id);
      if (findIndex === -1) {
        this.allAlbumList.push(albumToBeUpdated);
        this.allAlbumList = this.allAlbumList.sort((a, b) => b.albumName.localeCompare(a.albumName));
      } else {
        if (deleteAlbum) {
          this.allAlbumList.splice(findIndex, 1);
        } else {
          this.allAlbumList.splice(findIndex, 1, albumToBeUpdated);
        }
      }
      this.refreshAlbumList = true;
    },

    updateRefreshAlbumListFlag() {
      this.refreshAlbumList = !this.refreshAlbumList;
    },
  },
});
