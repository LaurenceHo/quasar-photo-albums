import { defineStore } from 'pinia';
import { LocalStorage } from 'quasar';
import { isEmpty } from 'radash';
import { Album, AlbumTag } from 'src/components/models';
import AlbumService from 'src/services/album-service';
import AlbumTagService from 'src/services/album-tag-service';
import { compareDbUpdatedTime, sortByKey } from 'src/utils/helper';

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
    year: 'na',
    id: '',
    albumName: '',
    albumCover: '',
    description: '',
    tags: [],
    isPrivate: false,
  },
  selectedYear: 'na',
};

const FILTERED_ALBUMS_BY_YEAR = 'FILTERED_ALBUMS_BY_YEAR';
const ALBUM_TAGS = 'ALBUM_TAGS';
const DB_UPDATED_TIME = 'DB_UPDATED_TIME';

const setAlbumToLocalStorage = async (year: string | undefined, updatedAlbumList: boolean) => {
  const { data: albums } = await albumService.getAlbumsByYear(year);
  if (albums) {
    const persistedAlbumData = {
      year,
      albums,
    };
    LocalStorage.set(FILTERED_ALBUMS_BY_YEAR, JSON.stringify(persistedAlbumData));
    updatedAlbumList = true;
  }
};

const setAlbumTagsToLocalStorage = async () => {
  const { data: tags } = await albumTagService.getAlbumTags();
  if (tags) {
    const albumTagsString = JSON.stringify(tags);
    LocalStorage.set(ALBUM_TAGS, albumTagsString);
  }
};

function getAlbumTagsFromLocalStorage() {
  const albumTagsString: string = LocalStorage.getItem(ALBUM_TAGS) || '';
  const tempAlbumTags: { tag: string }[] = !isEmpty(albumTagsString) ? JSON.parse(albumTagsString) : [];
  return sortByKey(tempAlbumTags, 'tag', 'asc');
}

export const albumStore = defineStore('albums', {
  state: () => initialState,

  getters: {
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
      const updatedAlbumList = false;
      this.loadingAllAlbumInformation = true;

      // Check if DB updated time first and compare with local storage
      let compareResult = { isLatest: true, dbUpdatedTime: '' };
      if (year === undefined) {
        compareResult = await compareDbUpdatedTime(LocalStorage.getItem(DB_UPDATED_TIME));
        // Set updated time in local storage
        LocalStorage.set(DB_UPDATED_TIME, compareResult.dbUpdatedTime);
      }

      const tempAlbumTagsString: string = LocalStorage.getItem(ALBUM_TAGS) || '';
      const tempAlbumsString = LocalStorage.getItem(FILTERED_ALBUMS_BY_YEAR);
      // If tempAlbumString is not empty, it means it's not user's first time visit the page
      const { year: yearForCompare }: { year: string; albums: Album[] } =
        !isEmpty(tempAlbumsString) && typeof tempAlbumsString === 'string' ? JSON.parse(tempAlbumsString) : {};

      // If local storage is not the latest data or request year is different from local storage (user selects year
      // from the dropdown),we should get albums from database
      if (year !== undefined && year !== yearForCompare) {
        await setAlbumToLocalStorage(year, updatedAlbumList);
      } else if (!compareResult.isLatest) {
        await setAlbumToLocalStorage(yearForCompare, updatedAlbumList);
      } else if (this.albumList.length === 0 || this.albumTags.length === 0) {
        // If memory cache is empty, it means user refresh the page or open the page
        // Only fetch albums if local storage is empty, and we didn't fetch albums from database yet
        if (isEmpty(tempAlbumsString) && !updatedAlbumList) {
          await setAlbumToLocalStorage(year, updatedAlbumList);
        }

        // Only fetch tags if it's empty
        if (isEmpty(tempAlbumTagsString)) {
          await setAlbumTagsToLocalStorage();
        }
      }
      // Get albums from local storage again
      const albumsString: string = LocalStorage.getItem(FILTERED_ALBUMS_BY_YEAR) || '';
      const { year: parsedYear, albums: parsedAlbum }: { year: string; albums: Album[] } = JSON.parse(albumsString);

      this.selectedYear = parsedYear;
      this.albumList = sortByKey(parsedAlbum, 'albumName', this.sortOrder);
      // Get album tags from local storage again
      this.albumTags = getAlbumTagsFromLocalStorage();

      this.loadingAllAlbumInformation = false;
    },

    updateAlbumCover(albumToBeUpdated: Album) {
      const findIndex = this.albumList.findIndex((album) => album.id === albumToBeUpdated.id);
      this.albumList.splice(findIndex, 1, albumToBeUpdated);
      // Update the selected album item in the store so that the album cover is updated in the photo detail dialog
      this.selectedAlbumItem = albumToBeUpdated;
      this.refreshAlbumList = true;
    },

    async updateAlbum() {
      await this.getAlbumsByYear();
      this.refreshAlbumList = true;
    },

    updateRefreshAlbumListFlag() {
      this.refreshAlbumList = !this.refreshAlbumList;
    },

    async updateAlbumTags(albumTag: AlbumTag, deleteTag: boolean) {
      await setAlbumTagsToLocalStorage();
      this.albumTags = getAlbumTagsFromLocalStorage();
    },

    setSearchKey(searchKey: string) {
      this.searchKey = searchKey;
    },

    setAlbumList(albums: Album[]) {
      this.albumList = albums;
    },
  },
});
