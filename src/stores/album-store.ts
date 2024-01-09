import { isEmpty } from 'lodash-es';
import { defineStore } from 'pinia';
import { Loading, LocalStorage } from 'quasar';
import { Album, AlbumTag } from 'src/components/models';
import AlbumService from 'src/services/album-service';
import AlbumTagService from 'src/services/album-tag-service';
import { photoStore } from 'stores/photo-store';
import { compareDbUpdatedTime } from 'src/helper';
import { userStore } from 'stores/user-store';

export interface AlbumState {
  loadingAllAlbumInformation: boolean;
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
      loadingAllAlbumInformation: true,
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
      (searchKey: string, selectedTags: string[], privateAlbum: boolean): Album[] => {
        let filteredAlbumList = state.allAlbumList;
        if (privateAlbum) {
          filteredAlbumList = filteredAlbumList.filter((album) => album.isPrivate);
        }
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

    albumsHaveLocation: (state: AlbumState) =>
      state.allAlbumList.filter((album) => album.place?.location?.latitude && album.place?.location?.longitude),
  },
  actions: {
    async getAllAlbumInformation() {
      if (this.allAlbumList.length === 0 || this.albumTags.length === 0) {
        const tempAlbumsString = LocalStorage.getItem('ALL_ALBUMS');
        const tempAlbumTagsString: string = LocalStorage.getItem('ALBUM_TAGS') || '';

        // If updated time from localStorage is empty or different from S3, get albums from database
        const compareResult = await compareDbUpdatedTime();
        if (!compareResult.isLatest || isEmpty(tempAlbumsString) || isEmpty(tempAlbumTagsString)) {
          Loading.show();
          this.loadingAllAlbumInformation = true;

          const { data: albums } = await albumService.getAlbums();
          if (albums) {
            const albumsString = JSON.stringify(albums);
            LocalStorage.set('ALL_ALBUMS', albumsString);
          }

          const { data: tags } = await albumTagService.getAlbumTags();
          if (tags) {
            const albumTagsString = JSON.stringify(tags);
            LocalStorage.set('ALBUM_TAGS', albumTagsString);
          }
          // Set updated time in local storage
          LocalStorage.set('DB_UPDATED_TIME', compareResult.time);
        }

        // Check user permission
        const store = userStore();
        await store.checkUserPermission();
        const isAdminUser = store.isAdminUser;

        // Get albums from local storage again
        const albumsString: string = LocalStorage.getItem('ALL_ALBUMS') || '';
        let tempList: Album[] = !isEmpty(albumsString) ? JSON.parse(albumsString) : [];
        if (!isAdminUser) {
          tempList = tempList.filter((album) => !album.isPrivate);
        }
        this.allAlbumList = tempList.sort((a, b) => {
          if (this.sortOrder === 'asc') {
            return a.albumName.localeCompare(b.albumName);
          } else {
            return b.albumName.localeCompare(a.albumName);
          }
        });
        // Get album tags from local storage again
        const albumTagsString: string = LocalStorage.getItem('ALBUM_TAGS') || '';
        const tempAlbumTags: { tag: string }[] = !isEmpty(albumTagsString) ? JSON.parse(albumTagsString) : [];
        this.albumTags = tempAlbumTags.sort((a, b) => a.tag.localeCompare(b.tag));

        Loading.hide();
        this.loadingAllAlbumInformation = false;
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
