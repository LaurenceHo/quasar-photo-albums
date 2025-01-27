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
  isPrivate: true
};

export interface FilteredAlbumsByYear {
  dbUpdatedTime: string | null;
  year: string;
  albums: Album[];
}

export interface AlbumTags {
  dbUpdatedTime: string;
  tags: AlbumTag[];
}

const _getStoredAlbums = (): FilteredAlbumsByYear | null => {
  const stored = localStorage.getItem(FILTERED_ALBUMS_BY_YEAR);
  return stored ? JSON.parse(stored) : null;
};

const _storeAlbums = (data: FilteredAlbumsByYear) => {
  localStorage.setItem(FILTERED_ALBUMS_BY_YEAR, JSON.stringify(data));
};

const _fetchAlbumsAndSetToLocalStorage = async (year: string, dbUpdatedTime?: string) => {
  const timestamp = dbUpdatedTime || (await fetchDbUpdatedTime());

  const { data: albums, code, message } = await AlbumService.getAlbumsByYear(year);
  if (code !== 200) {
    throw Error(message);
  }

  if (albums) {
    _storeAlbums({
      dbUpdatedTime: timestamp,
      year,
      albums
    });
  }

  return albums;
};

const _shouldRefetchAlbums = async (year?: string, forceUpdate = false): Promise<boolean> => {
  // If local storage is empty, we should fetch albums from database
  const stored = _getStoredAlbums();
  if (!stored) return true;

  // If forceUpdate is true, we should fetch albums from database
  if (forceUpdate) return true;

  // If local storage is not the latest data or request year (query parameter) is different from local storage
  // (user selects year from the dropdown),we should get albums from database
  const { isLatest } = await compareDbUpdatedTime(stored.dbUpdatedTime);
  if (!isLatest) return true;

  if (year !== undefined && year !== stored.year) return true;

  return false;
};

const currentAlbum = ref(initialAlbum);
const albumToBeUpdate = ref(initialAlbum);
const isFetchingAlbums = ref(false);
const albumList = ref<Album[]>([]);

export default function useAlbums() {
  const fetchAlbumsByYear = async (year?: string, forceUpdate = false) => {
    isFetchingAlbums.value = true;

    try {
      const needsRefetch = await _shouldRefetchAlbums(year, forceUpdate);

      if (needsRefetch) {
        const albums = await _fetchAlbumsAndSetToLocalStorage(year ?? 'na');
        if (!albums) return;
        albumList.value = sortByKey(albums, 'albumName', 'asc');
      } else {
        // If we don't need to refetch, we should get albums from local storage instead
        const stored = _getStoredAlbums();
        if (stored) {
          albumList.value = sortByKey(stored.albums, 'albumName', 'asc');
        }
      }
    } catch (error) {
      isFetchingAlbums.value = false;
      throw error;
    }

    isFetchingAlbums.value = false;
  };

  const setAlbumToBeUpdated = (album: Album) => {
    albumToBeUpdate.value = album;
  };

  const setCurrentAlbum = (album: Album) => {
    currentAlbum.value = album;
  };

  const isAlbumCover = (photoKey: string) => photoKey === currentAlbum.value.albumCover;

  return {
    // Getters
    isFetchingAlbums: computed(() => isFetchingAlbums.value),
    albumList: computed(() => albumList.value),
    albumToBeUpdate: computed(() => albumToBeUpdate.value),
    currentAlbum: computed(() => currentAlbum.value),
    // Actions
    fetchAlbumsByYear,
    setAlbumToBeUpdated,
    setCurrentAlbum,
    isAlbumCover
  };
}
