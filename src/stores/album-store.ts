import isEmpty from 'lodash/isEmpty';
import { defineStore } from 'pinia';
import { Loading, LocalStorage } from 'quasar';
import { Album, AlbumTag } from 'src/components/models';
import AlbumService from 'src/services/album-service';
import AlbumTagService from 'src/services/album-tag-service';
import { photoStore } from 'stores/photo-store';
import { compareDbUpdatedTime } from 'src/helper';

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

        // If updated time from localStorage is empty or different from S3, get albums from database
        const compareResult = await compareDbUpdatedTime();
        if (!compareResult.isLatest) {
          const tempList = await albumService.getAlbums();
          const albumsString = JSON.stringify(tempList);
          LocalStorage.set('ALL_ALBUMS', albumsString);
          LocalStorage.set('DB_UPDATED_TIME', compareResult.time);
        }

        // Get albums from local storage
        const albumsString: string = LocalStorage.getItem('ALL_ALBUMS') || '';
        const tempList: Album[] = JSON.parse(albumsString);
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

        const compareResult = await compareDbUpdatedTime();
        if (!compareResult.isLatest) {
          const tempAlbumTags = await albumTagService.getAlbumTags();
          const albumTagsString = JSON.stringify(tempAlbumTags);
          LocalStorage.set('ALBUM_TAGS', albumTagsString);
          LocalStorage.set('DB_UPDATED_TIME', compareResult.time);
        }

        const albumTagsString: string = LocalStorage.getItem('ALBUM_TAGS') || '';
        const tempAlbumTags: { tag: string }[] = JSON.parse(albumTagsString);

        this.albumTags = tempAlbumTags.sort((a, b) => a.tag.localeCompare(b.tag));
        this.loadingAlbumTags = false;
      }
    },

    updateAlbumCover(albumToBeUpdated: Album) {
      const findIndex = this.allAlbumList.findIndex((album) => album.id === albumToBeUpdated.id);
      this.allAlbumList.splice(findIndex, 1, albumToBeUpdated);
      // Update the selected album item in photo store so that the album cover is updated in the photo detail dialog
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
