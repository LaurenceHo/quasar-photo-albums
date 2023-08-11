import isEmpty from 'lodash/isEmpty';
import { defineStore } from 'pinia';
import { Loading } from 'quasar';
import { Album, AlbumTag } from 'src/components/models';
import AlbumService from 'src/services/album-service';
import AlbumTagService from 'src/services/album-tag-service';
import { photoStore } from 'stores/photo-store';

export interface AlbumState {
  loadingAlbums: boolean;
  loadingAlbumTags: boolean;
  allAlbumList: Album[];
  albumTags: AlbumTag[];
  searchKey: string;
  sortOrder: 'asc' | 'desc';
  refreshAlbumList: boolean;
}

const albumService = new AlbumService();
const albumTagService = new AlbumTagService();

export const albumStore = defineStore('albums', {
  state: () =>
    ({
      loadingAlbums: false,
      loadingAlbumTags: false,
      allAlbumList: [],
      albumTags: [],
      searchKey: '',
      sortOrder: 'desc',
      refreshAlbumList: false,
    }) as AlbumState,
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
                album.description?.toLowerCase().includes(searchKey.toLowerCase())
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
    async getAlbums() {
      if (this.allAlbumList.length === 0) {
        Loading.show();
        this.loadingAlbums = true;
        const tempList = await albumService.getAlbums();
        this.allAlbumList = tempList.sort((a, b) => {
          if (this.sortOrder === 'asc') {
            return a.albumName.localeCompare(b.albumName);
          } else {
            return b.albumName.localeCompare(a.albumName);
          }
        });
        Loading.hide();
        this.loadingAlbums = false;
      }
    },

    async getAlbumTags() {
      if (this.albumTags.length === 0) {
        this.loadingAlbumTags = true;
        const tempAlbumTags = await albumTagService.getAlbumTags();
        this.albumTags = tempAlbumTags.sort((a, b) => a.tag.localeCompare(b.tag));
        this.loadingAlbumTags = false;
      }
    },

    updateAlbumCover(albumToBeUpdated: Album) {
      const findIndex = this.allAlbumList.findIndex((album) => album.id === albumToBeUpdated.id);
      this.allAlbumList.splice(findIndex, 1, albumToBeUpdated);
      const store = photoStore();
      store.selectedAlbumItem = albumToBeUpdated;
      this.refreshAlbumList = true;
    },

    updateAlbum(albumToBeUpdated: Album, deleteAlbum: boolean) {
      const findIndex = this.allAlbumList.findIndex((album) => album.id === albumToBeUpdated.id);
      if (findIndex === -1) {
        this.allAlbumList.push(albumToBeUpdated);
        this.allAlbumList = this.allAlbumList.sort((a, b) => {
          if (this.sortOrder === 'asc') {
            return a.albumName.localeCompare(b.albumName);
          } else {
            return b.albumName.localeCompare(a.albumName);
          }
        });
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

    updateAlbumTags(albumTag: AlbumTag, deleteTag: boolean) {
      if (deleteTag) {
        const findIndex = this.albumTags.findIndex((tag) => tag.tag === albumTag.tag);
        this.albumTags.splice(findIndex, 1);
      } else {
        this.albumTags.push(albumTag);
      }
      this.albumTags = this.albumTags.sort((a, b) => a.tag.localeCompare(b.tag));
    },
  },
});
