import { defineStore } from 'pinia';
import { LocalStorage } from 'quasar';
import { get, isEmpty } from 'radash';
import { Album, AlbumTag } from 'src/components/models';
import AlbumService from 'src/services/album-service';
import AlbumTagService from 'src/services/album-tag-service';
import { compareDbUpdatedTime, getStaticFileUrl, sortByKey } from 'src/utils/helper';

export interface AlbumState {
  loadingAllAlbumInformation: boolean;
  albumList: Album[];
  albumTags: AlbumTag[];
  searchKey: string;
  sortOrder: 'asc' | 'desc';
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

export const UPDATED_DB_TIME_FILE = 'updateDatabaseAt.json';
export const FILTERED_ALBUMS_BY_YEAR = 'FILTERED_ALBUMS_BY_YEAR';
export const ALBUM_TAGS = 'ALBUM_TAGS';

interface FilteredAlbumsByYear {
  dbUpdatedTime: string;
  year: string;
  albums: Album[];
}

const _fetchDbUpdatedTime = async () => {
  const response = await fetch(getStaticFileUrl(UPDATED_DB_TIME_FILE));
  const dbUpdatedTimeJSON = await response.json();
  return dbUpdatedTimeJSON.time;
};

const _fetchAlbumAndSetToLocalStorage = async (year: string | undefined, dbUpdatedTime?: string) => {
  let time = dbUpdatedTime;
  if (!time) {
    time = await _fetchDbUpdatedTime();
  }

  const { data: albums } = await albumService.getAlbumsByYear(year);
  if (albums) {
    LocalStorage.set(
      FILTERED_ALBUMS_BY_YEAR,
      JSON.stringify({
        dbUpdatedTime: time,
        year,
        albums,
      } as FilteredAlbumsByYear)
    );
  }
};

const _fetchAlbumTagsAndSetToLocalStorage = async (dbUpdatedTime?: string) => {
  let time = dbUpdatedTime;
  if (!time) {
    time = await _fetchDbUpdatedTime();
  }

  const { data: tags } = await albumTagService.getAlbumTags();
  if (tags) {
    LocalStorage.set(
      ALBUM_TAGS,
      JSON.stringify({
        dbUpdatedTime: time,
        tags,
      })
    );
  }
};

const _getAlbumsFromLocalStorage = (sortOrder: 'asc' | 'desc') => {
  const albumsString: string = LocalStorage.getItem(FILTERED_ALBUMS_BY_YEAR) || '';
  const tempAlbumTags = get(JSON.parse(albumsString), 'albums', []) as Album[];
  return sortByKey(tempAlbumTags, 'albumName', sortOrder);
};

const _getAlbumTagsFromLocalStorage = () => {
  const albumTagsString: string = LocalStorage.getItem(ALBUM_TAGS) || '';
  const tempAlbumTags = get(JSON.parse(albumTagsString), 'tags', []) as AlbumTag[];
  return sortByKey(tempAlbumTags, 'tag', 'asc');
};

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
    async getAlbumsByYear(year?: string, forceUpdate = false) {
      this.loadingAllAlbumInformation = true;

      if (!LocalStorage.getItem(FILTERED_ALBUMS_BY_YEAR)) {
        await _fetchAlbumAndSetToLocalStorage(year);
      } else {
        const filteredAlbumsByYear: FilteredAlbumsByYear = JSON.parse(
          <string>LocalStorage.getItem(FILTERED_ALBUMS_BY_YEAR)
        );
        const compareResult = await compareDbUpdatedTime(filteredAlbumsByYear.dbUpdatedTime);
        // If local storage is not the latest data or request year is different from local storage (user selects year
        // from the dropdown),we should get albums from database
        if (forceUpdate || !compareResult.isLatest || (year !== undefined && year !== filteredAlbumsByYear.year)) {
          await _fetchAlbumAndSetToLocalStorage(year, compareResult.dbUpdatedTime);
        }
      }

      if (!LocalStorage.getItem(ALBUM_TAGS)) {
        await _fetchAlbumTagsAndSetToLocalStorage();
      } else {
        const compareResult = await compareDbUpdatedTime(
          JSON.parse(<string>LocalStorage.getItem(ALBUM_TAGS)).dbUpdatedTime
        );
        if (forceUpdate || !compareResult.isLatest) {
          await _fetchAlbumTagsAndSetToLocalStorage(compareResult.dbUpdatedTime);
        }
      }

      // Get albums from local storage again
      const filteredAlbumsByYear: FilteredAlbumsByYear = JSON.parse(
        <string>LocalStorage.getItem(FILTERED_ALBUMS_BY_YEAR)
      );

      this.selectedYear = filteredAlbumsByYear.year;
      this.albumList = sortByKey(filteredAlbumsByYear.albums, 'albumName', this.sortOrder);
      // Get album tags from local storage again
      this.albumTags = _getAlbumTagsFromLocalStorage();

      this.loadingAllAlbumInformation = false;
    },

    sortByKey(sortOrder: 'asc' | 'desc') {
      this.albumList = sortByKey(this.albumList, 'albumName', sortOrder);
    },
  },
});
