import { Album } from 'components/models';
import isEmpty from 'lodash/isEmpty';
import { defineStore } from 'pinia';
import { Loading, Notify } from 'quasar';
import AlbumService from 'src/services/album-service';

export interface AlbumState {
  loadingAlbums: boolean;
  loadingAlbumTags: boolean;
  allAlbumList: Album[];
  albumTags: string[];
  searchKey: string;
  refreshAlbumList: boolean;
}

const albumService = new AlbumService();

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

    async getAlbums(startIndex?: number, endIndex?: number, filter?: string) {
      Loading.show();
      this.loadingAlbums = true;
      try {
        this.allAlbumList = await albumService.getAlbums(startIndex, endIndex, filter);
      } catch (error: any) {
        Notify.create({
          color: 'negative',
          icon: 'mdi-alert-circle-outline',
          message: error.toString(),
        });
      } finally {
        Loading.hide();
        this.loadingAlbums = false;
      }
    },

    async getAlbumTags() {
      this.loadingAlbumTags = true;
      try {
        const albumTags = await albumService.getAlbumTags();
        this.albumTags = albumTags.map((t) => t.tag);
      } catch (error: any) {
        Notify.create({
          color: 'negative',
          icon: 'mdi-alert-circle-outline',
          message: error.toString(),
        });
      } finally {
        this.loadingAlbumTags = false;
      }
    },

    updateAlbum(albumToBeUpdated: Album, deleteAlbum: boolean) {
      const findIndex = this.allAlbumList.findIndex((album) => album.id === albumToBeUpdated.id);
      if (findIndex > -1) {
        if (deleteAlbum) {
          this.allAlbumList.splice(findIndex, 1);
        } else {
          this.allAlbumList.splice(findIndex, 1, albumToBeUpdated);
        }
        this.refreshAlbumList = true;
      }
    },

    updateRefreshAlbumListFlag() {
      this.refreshAlbumList = !this.refreshAlbumList;
    },
  },
});
