import isEmpty from 'lodash/isEmpty';
import orderBy from 'lodash/orderBy';
import { defineStore } from 'pinia';
import { Loading } from 'quasar';
import { Album, AlbumTag } from 'src/components/models';
import AlbumService from 'src/services/album-service';
import AlbumTagService from 'src/services/album-tag-service';

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

export const albumStore = defineStore('album', {
  state: () =>
    ({
      loadingAlbums: false,
      loadingAlbumTags: false,
      allAlbumList: [],
      albumTags: [],
      searchKey: '',
      sortOrder: 'desc',
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
    setSortOrder(sort: 'asc' | 'desc') {
      this.sortOrder = sort;
    },

    setSearchKey(input: string) {
      this.searchKey = input;
    },

    async getAlbums() {
      if (this.allAlbumList.length === 0) {
        Loading.show();
        this.loadingAlbums = true;
        const tempList = await albumService.getAlbums();
        this.allAlbumList = orderBy(tempList, 'albumName', this.sortOrder);
        Loading.hide();
        this.loadingAlbums = false;
      }
    },

    async getAlbumTags() {
      if (this.albumTags.length === 0) {
        this.loadingAlbumTags = true;
        this.albumTags = await albumTagService.getAlbumTags();
        this.loadingAlbumTags = false;
      }
    },

    updateAlbumCover(albumToBeUpdated: Album) {
      const findIndex = this.allAlbumList.findIndex((album) => album.id === albumToBeUpdated.id);
      this.allAlbumList.splice(findIndex, 1, albumToBeUpdated);
    },

    updateAlbum(albumToBeUpdated: Album, deleteAlbum: boolean) {
      const findIndex = this.allAlbumList.findIndex((album) => album.id === albumToBeUpdated.id);
      if (findIndex === -1) {
        this.allAlbumList.push(albumToBeUpdated);
        this.allAlbumList = orderBy(this.allAlbumList, 'albumName', this.sortOrder);
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
        const findIndex = this.albumTags.findIndex((tag) => tag.id === albumTag.id);
        this.albumTags.splice(findIndex, 1);
      } else {
        this.albumTags.push(albumTag);
      }
      this.albumTags = this.albumTags.sort((a, b) => a.tag.localeCompare(b.tag));
    },
  },
});
