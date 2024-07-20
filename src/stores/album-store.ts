import { defineStore } from 'pinia';
import { LocalStorage } from 'quasar';
import { get, isEmpty } from 'radash';
import { Album, AlbumsByYear, AlbumTag } from 'src/components/models';
import AggregateService from 'src/services/aggregate-service';
import AlbumService from 'src/services/album-service';
import AlbumTagService from 'src/services/album-tag-service';
import { compareDbUpdatedTime, getStaticFileUrl, sortByKey } from 'src/utils/helper';

export interface AlbumState {
  loadingAllAlbumInformation: boolean;
  loadingCountAlbumsByYear: boolean;
  loadingFeaturedAlbums: boolean;
  albumList: Album[];
  albumTags: AlbumTag[];
  searchKey: string;
  sortOrder: 'asc' | 'desc';
  selectedAlbumItem: Album;
  countAlbumsByYear: AlbumsByYear;
  featuredAlbums: Album[];
}

const albumService = new AlbumService();
const albumTagService = new AlbumTagService();
const aggregateService = new AggregateService();

const initialState: AlbumState = {
  loadingAllAlbumInformation: true,
  loadingCountAlbumsByYear: true,
  loadingFeaturedAlbums: true,
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
  countAlbumsByYear: [],
  featuredAlbums: [],
};

export const UPDATED_DB_TIME_FILE = 'updateDatabaseAt.json';
export const FILTERED_ALBUMS_BY_YEAR = 'FILTERED_ALBUMS_BY_YEAR';
export const ALBUM_TAGS = 'ALBUM_TAGS';
export const FEATURED_ALBUMS = 'FEATURED_ALBUMS';

export interface FilteredAlbumsByYear {
  dbUpdatedTime: string;
  year: string;
  albums: Album[];
}

interface AlbumTags {
  dbUpdatedTime: string;
  tags: AlbumTag[];
}

const _fetchDbUpdatedTime = async () => {
  const response = await fetch(getStaticFileUrl(UPDATED_DB_TIME_FILE));
  const dbUpdatedTimeJSON = await response.json();
  return dbUpdatedTimeJSON.time;
};

const _fetchAlbumsAndSetToLocalStorage = async (year: string | undefined, dbUpdatedTime?: string) => {
  let time = dbUpdatedTime;
  if (!time) {
    time = await _fetchDbUpdatedTime();
  }

  const { data: albums, code, message } = await albumService.getAlbumsByYear(year);
  if (code !== 200) {
    throw Error(message);
  }

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

  const { data: tags, code, message } = await albumTagService.getAlbumTags();

  if (code !== 200) {
    throw Error(message);
  }

  if (tags) {
    LocalStorage.set(
      ALBUM_TAGS,
      JSON.stringify({
        dbUpdatedTime: time,
        tags: sortByKey(tags, 'tag', 'asc'),
      } as AlbumTags)
    );
  }
};

const _fetchFeaturedAlbumsAndSetToLocalStorage = async (dbUpdatedTime?: string) => {
  let time = dbUpdatedTime;
  if (!time) {
    time = await _fetchDbUpdatedTime();
  }

  const { data: albums, code, message } = await aggregateService.getAggregateData('featuredAlbums');
  if (code !== 200) {
    throw Error(message);
  }

  if (albums) {
    LocalStorage.set(
      FEATURED_ALBUMS,
      JSON.stringify({
        dbUpdatedTime: time,
        albums,
      } as FilteredAlbumsByYear)
    );
  }
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

      try {
        if (!LocalStorage.getItem(FILTERED_ALBUMS_BY_YEAR)) {
          await _fetchAlbumsAndSetToLocalStorage(year);
        } else {
          const filteredAlbumsByYear: FilteredAlbumsByYear = JSON.parse(
            <string>LocalStorage.getItem(FILTERED_ALBUMS_BY_YEAR)
          );
          const compareResult = await compareDbUpdatedTime(filteredAlbumsByYear.dbUpdatedTime);
          // If local storage is not the latest data or request year is different from local storage (user selects year
          // from the dropdown),we should get albums from database
          if (forceUpdate || !compareResult.isLatest || (year !== undefined && year !== filteredAlbumsByYear.year)) {
            await _fetchAlbumsAndSetToLocalStorage(year, compareResult.dbUpdatedTime);
          }
        }

        // Get albums from local storage again
        const filteredAlbumsByYear: FilteredAlbumsByYear = JSON.parse(
          LocalStorage.getItem(FILTERED_ALBUMS_BY_YEAR) || '{}'
        );

        this.albumList = sortByKey(filteredAlbumsByYear.albums, 'albumName', this.sortOrder);
      } catch (error) {
        this.loadingAllAlbumInformation = false;
        return;
      }

      try {
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

        // Get album tags from local storage again
        this.albumTags = get(
          JSON.parse(LocalStorage.getItem(ALBUM_TAGS) || '{}') as AlbumTags,
          'tags',
          []
        ) as AlbumTag[];
      } catch (error) {
        this.loadingAllAlbumInformation = false;
        return;
      }

      this.loadingAllAlbumInformation = false;
    },

    async getCountAlbumsByYear() {
      this.loadingCountAlbumsByYear = true;

      const { data } = await aggregateService.getAggregateData('countAlbumsByYear');
      this.countAlbumsByYear = data as AlbumsByYear;
      this.loadingCountAlbumsByYear = false;
    },

    async getFeaturedAlbums() {
      this.loadingFeaturedAlbums = true;
      try {
        if (!LocalStorage.getItem(FEATURED_ALBUMS)) {
          await _fetchFeaturedAlbumsAndSetToLocalStorage();
        } else {
          const compareResult = await compareDbUpdatedTime(
            JSON.parse(<string>LocalStorage.getItem(FEATURED_ALBUMS)).dbUpdatedTime
          );
          if (!compareResult.isLatest) {
            await _fetchFeaturedAlbumsAndSetToLocalStorage(compareResult.dbUpdatedTime);
          }
        }

        this.featuredAlbums = get(
          JSON.parse(LocalStorage.getItem(FEATURED_ALBUMS) || '{}') as AlbumTags,
          'albums',
          []
        ) as Album[];
      } catch (error) {
        this.loadingFeaturedAlbums = false;
      } finally {
        this.loadingFeaturedAlbums = false;
      }
    },

    sortByKey(sortOrder: 'asc' | 'desc') {
      this.albumList = sortByKey(this.albumList, 'albumName', sortOrder);
    },
  },
});
