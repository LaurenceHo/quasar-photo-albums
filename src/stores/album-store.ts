import { defineStore } from 'pinia';
import { LocalStorage } from 'quasar';
import { isEmpty } from 'radash';
import { Album, AlbumTag } from 'src/components/models';
import AlbumService from 'src/services/album-service';
import AlbumTagService from 'src/services/album-tag-service';
import { compareDbUpdatedTime, sortByKey } from 'src/utils/helper';
import { userStore } from 'stores/user-store';

export interface AlbumState {
  loadingAllAlbumInformation: boolean;
  albumList: Album[];
  albumTags: AlbumTag[];
  searchKey: string;
  sortOrder: 'asc' | 'desc';
  refreshAlbumList: boolean;
  selectedAlbumItem: Album;
  selectedYear: string;
}

const albumService = new AlbumService();
const albumTagService = new AlbumTagService();

const initialState: AlbumState = {
  loadingAllAlbumInformation: true,
  albumList: [],
  albumTags: [],
  searchKey: '',
  sortOrder: 'desc',
  refreshAlbumList: false,
  selectedAlbumItem: {
    year: 'n/a',
    id: '',
    albumName: '',
    albumCover: '',
    description: '',
    tags: [],
    isPrivate: false,
    order: 0,
  },
  selectedYear: 'n/a',
};
export const albumStore = defineStore('albums', {
  state: () => initialState,

  getters: {
    getAlbumById:
      (state: AlbumState) =>
      (id: string): Album | undefined =>
        state.albumList.find((album) => album.id === id),

    chunkAlbumList:
      (state: AlbumState) =>
      (firstIndex: number, lastIndex: number): Album[] => {
        if (!isEmpty(state.albumList)) {
          return state.albumList.slice(firstIndex, lastIndex);
        } else {
          return [];
        }
      },

    filteredAlbumList:
      (state: AlbumState) =>
      (searchKey: string, selectedTags: string[], privateAlbum: boolean): Album[] => {
        let filteredAlbumList = state.albumList;
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
      state.albumList.filter((album) => album.place?.location?.latitude && album.place?.location?.longitude),

    isAlbumCover: (state: AlbumState) => (photoKey: string) => state.selectedAlbumItem.albumCover === photoKey,
  },

  actions: {
    async getAlbumsByYear(year?: string) {
      const tempAlbumTagsString: string = LocalStorage.getItem('ALBUM_TAGS') || '';
      const tempAlbumsString = LocalStorage.getItem('FILTERED_ALBUMS_BY_YEAR');
      const { year: yearForCompare }: { year: string; albums: Album[] } =
        !isEmpty(tempAlbumsString) && typeof tempAlbumsString === 'string' ? JSON.parse(tempAlbumsString) : {};

      this.loadingAllAlbumInformation = true;

      if (this.albumList.length === 0 || (year !== undefined && year !== yearForCompare)) {
        // If updated time from localStorage is empty or different from S3, get albums from database
        const compareResult = await compareDbUpdatedTime();
        if (
          !compareResult.isLatest ||
          isEmpty(tempAlbumsString) ||
          (!isEmpty(tempAlbumsString) && year !== undefined && year !== yearForCompare)
        ) {
          const { data: albums } = await albumService.getAlbums(year);
          if (albums) {
            const persistedAlbumData = {
              year,
              albums,
            };
            LocalStorage.set('FILTERED_ALBUMS_BY_YEAR', JSON.stringify(persistedAlbumData));
          }

          // Only fetch tags if it's empty
          if (isEmpty(tempAlbumTagsString)) {
            const { data: tags } = await albumTagService.getAlbumTags();
            if (tags) {
              const albumTagsString = JSON.stringify(tags);
              LocalStorage.set('ALBUM_TAGS', albumTagsString);
            }
          }
          // Set updated time in local storage
          LocalStorage.set('DB_UPDATED_TIME', compareResult.time);
        }

        // Get albums from local storage again
        const albumsString: string = LocalStorage.getItem('FILTERED_ALBUMS_BY_YEAR') || '';
        const { year: parsedYear, albums }: { year: string; albums: Album[] } = JSON.parse(albumsString);

        this.selectedYear = parsedYear;
        this.albumList = sortByKey(albums, 'albumName', this.sortOrder);
        // Get album tags from local storage again
        const albumTagsString: string = LocalStorage.getItem('ALBUM_TAGS') || '';
        const tempAlbumTags: { tag: string }[] = !isEmpty(albumTagsString) ? JSON.parse(albumTagsString) : [];
        this.albumTags = tempAlbumTags.sort((a, b) => a.tag.localeCompare(b.tag));
      }
      this.loadingAllAlbumInformation = false;
    },

    updateAlbumCover(albumToBeUpdated: Album) {
      const findIndex = this.albumList.findIndex((album) => album.id === albumToBeUpdated.id);
      this.albumList.splice(findIndex, 1, albumToBeUpdated);
      // Update the selected album item in the store so that the album cover is updated in the photo detail dialog
      this.selectedAlbumItem = albumToBeUpdated;
      this.refreshAlbumList = true;
    },

    updateAlbum(albumToBeUpdated: Album, deleteAlbum: boolean) {
      if (this.selectedYear === albumToBeUpdated.year) {
        const findIndex = this.albumList.findIndex((album) => album.id === albumToBeUpdated.id);
        if (findIndex === -1) {
          this.albumList.push(albumToBeUpdated);
          this.albumList = this.albumList.sort((a, b) => {
            if (this.sortOrder === 'asc') {
              return a.albumName.localeCompare(b.albumName);
            } else {
              return b.albumName.localeCompare(a.albumName);
            }
          });
        } else {
          if (deleteAlbum) {
            this.albumList.splice(findIndex, 1);
          } else {
            this.albumList.splice(findIndex, 1, albumToBeUpdated);
          }
        }
        this.refreshAlbumList = true;
      }
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

    setSearchKey(searchKey: string) {
      this.searchKey = searchKey;
    },

    setAlbumList(albums: Album[]) {
      this.albumList = albums;
    },
  },
});
