import type { Album, AlbumTag } from '@/schema';
import { AlbumService } from '@/services/album-service';
import { compareDbUpdatedTime, fetchDbUpdatedTime, sortByKey } from '@/utils/helper';
import { FILTERED_ALBUMS_BY_YEAR } from '@/utils/local-storage-key';
import { computed, ref } from 'vue';

export const initialAlbum: Album = {
  year: '',
  id: '',
  albumName: '',
  albumCover: '',
  description: '',
  tags: [],
  isPrivate: true,
};

export interface FilteredAlbumsByYear {
  dbUpdatedTime: string;
  year: string;
  albums: Album[];
}

export interface AlbumTags {
  dbUpdatedTime: string;
  tags: AlbumTag[];
}

const _fetchAlbumsAndSetToLocalStorage = async (year: string | undefined, dbUpdatedTime?: string) => {
  let time = dbUpdatedTime;
  if (!time) {
    time = await fetchDbUpdatedTime();
  }

  const { data: albums, code, message } = await AlbumService.getAlbumsByYear(year);
  if (code !== 200) {
    throw Error(message);
  }

  if (albums) {
    localStorage.setItem(
      FILTERED_ALBUMS_BY_YEAR,
      JSON.stringify({
        dbUpdatedTime: time,
        year,
        albums,
      } as FilteredAlbumsByYear),
    );
  }
};

const currentAlbum = ref(initialAlbum as Album);
const albumToBeUpdate = ref(initialAlbum as Album);

const isFetchingAlbums = ref(false);
const albumList = ref<Album[]>([]);
const albumSearchKey = ref('');

export default function AlbumsContext() {
  const getAlbumList = computed(() => albumList.value);

  const getIsFetchingAlbums = computed(() => isFetchingAlbums.value);

  const fetchAlbumsByYear = async (year?: string, forceUpdate = false) => {
    isFetchingAlbums.value = true;

    try {
      if (!localStorage.getItem(FILTERED_ALBUMS_BY_YEAR)) {
        await _fetchAlbumsAndSetToLocalStorage(year);
      } else {
        const filteredAlbumsByYear: FilteredAlbumsByYear = JSON.parse(
          <string>localStorage.getItem(FILTERED_ALBUMS_BY_YEAR),
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
        localStorage.getItem(FILTERED_ALBUMS_BY_YEAR) || '{}',
      );
      albumList.value = sortByKey(filteredAlbumsByYear.albums, 'albumName', 'asc');
    } catch (error) {
      isFetchingAlbums.value = false;
      throw error;
    }

    isFetchingAlbums.value = false;
  };

  const getAlbumToBeUpdate = computed(() => albumToBeUpdate.value);

  const setAlbumToBeUpdated = (album: Album) => {
    albumToBeUpdate.value = album;
  };

  const getCurrentAlbum = computed(() => currentAlbum.value);

  const setCurrentAlbum = (album: Album) => {
    currentAlbum.value = album;
  };

  const isAlbumCover = (photoKey: string) => photoKey === currentAlbum.value.albumCover;

  return {
    albumSearchKey,
    isFetchingAlbums: getIsFetchingAlbums,
    albumList: getAlbumList,
    albumToBeUpdate: getAlbumToBeUpdate,
    currentAlbum: getCurrentAlbum,
    fetchAlbumsByYear,
    setAlbumToBeUpdated,
    setCurrentAlbum,
    isAlbumCover,
  };
}
