import type { Album } from '@/schema';
import { AlbumService } from '@/services/album-service';
import {
  compareDbUpdatedTime,
  fetchDbUpdatedTime,
  getDataFromLocalStorage,
  setDataIntoLocalStorage,
  sortByKey,
} from '@/utils/helper';
import { FILTERED_ALBUMS_BY_YEAR } from '@/utils/local-storage-key';
import { useQuery, useQueryClient } from '@tanstack/vue-query';
import { defineStore } from 'pinia';
import { isEmpty } from 'radash';
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

export const initialAlbum: Album = {
  year: String(new Date().getFullYear()),
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

export interface AlbumFilterState {
  searchKey: string;
  selectedTags: string[];
  privateOnly: boolean;
  sortOrder: 'asc' | 'desc';
}

const _shouldRefetchAlbums = async (year?: string, forceUpdate = false): Promise<boolean> => {
  const stored = getDataFromLocalStorage(FILTERED_ALBUMS_BY_YEAR) as FilteredAlbumsByYear;
  if (!stored) return true;
  if (forceUpdate) return true;
  const { isLatest } = await compareDbUpdatedTime(stored.dbUpdatedTime, 'album');
  if (!isLatest) return true;
  return year !== undefined && year !== stored.year;
};

const _fetchAlbumsAndSetToLocalStorage = async (year: string, forceUpdate: boolean) => {
  try {
    if (!(await _shouldRefetchAlbums(year, forceUpdate))) {
      const albumLocationsWithDBTime = getDataFromLocalStorage(
        FILTERED_ALBUMS_BY_YEAR,
      ) as FilteredAlbumsByYear;
      return albumLocationsWithDBTime ? albumLocationsWithDBTime.albums : [];
    }

    const timeJson = await fetchDbUpdatedTime();
    const { data: albums, code, message } = await AlbumService.getAlbumsByYear(year);

    if (code !== 200) {
      console.error('Error fetching albums:', message);
      return [];
    }

    if (albums) {
      const filteredAlbumsByYear = {
        dbUpdatedTime: timeJson?.album || '',
        year,
        albums,
      };
      setDataIntoLocalStorage(FILTERED_ALBUMS_BY_YEAR, filteredAlbumsByYear);
      return albums;
    }

    return [];
  } catch (error) {
    console.error('Error fetching albums:', error);
    throw error;
  }
};

export const useAlbumStore = defineStore('album', () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const isEnabled = ref(false);
  const selectedYear = ref<string>('na');
  const currentAlbum = ref(initialAlbum);
  const albumToBeUpdate = ref(initialAlbum);
  const filterState = ref<AlbumFilterState>({
    searchKey: '',
    selectedTags: [],
    privateOnly: false,
    sortOrder: 'desc',
  });
  const filteredAlbums = ref<Album[]>([]);
  const filteredAlbumsByYear = ref<FilteredAlbumsByYear | null>(
    getDataFromLocalStorage(FILTERED_ALBUMS_BY_YEAR) as FilteredAlbumsByYear,
  );

  // Make queryKey reactive by using a computed property
  const queryKey = computed(() => ['fetchAlbumsByYears', selectedYear.value]);

  const {
    data,
    isFetching,
    isError,
    refetch: refetchQuery,
  } = useQuery({
    queryKey, // Use the computed queryKey
    queryFn: async () => {
      const albums = await _fetchAlbumsAndSetToLocalStorage(selectedYear.value, false);
      filteredAlbumsByYear.value = getDataFromLocalStorage(
        FILTERED_ALBUMS_BY_YEAR,
      ) as FilteredAlbumsByYear;
      return albums;
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: isEnabled,
  });

  // Watch selectedYear and update route only if necessary
  watch(
    selectedYear,
    async (newYear) => {
      // Only push route if it differs from current route
      if (router.currentRoute.value.params.year !== newYear) {
        await router.push({ name: 'albumsByYear', params: { year: newYear } });
      }
    },
    { immediate: false },
  );

  const refetchAlbums = async (year: string, forceRefetch = false) => {
    if (forceRefetch) {
      return queryClient.fetchQuery({
        queryKey: ['fetchAlbumsByYears', year],
        queryFn: () => _fetchAlbumsAndSetToLocalStorage(year, true),
      });
    }
    return refetchQuery();
  };

  const applyFilters = () => {
    let result = [...(data.value || [])];

    if (filterState.value.privateOnly) {
      result = result.filter((album) => album.isPrivate);
    }

    if (filterState.value.searchKey) {
      const searchTerm = filterState.value.searchKey.toLowerCase();
      result = result.filter(
        (album) =>
          album.albumName.toLowerCase().includes(searchTerm) ||
          album.description?.toLowerCase().includes(searchTerm),
      );
    }

    if (!isEmpty(filterState.value.selectedTags)) {
      result = result.filter((album) =>
        filterState.value.selectedTags.some((tag) => album.tags?.includes(tag)),
      );
    }

    filteredAlbums.value = sortByKey(result, 'albumName', filterState.value.sortOrder);
  };

  watch(
    () => data?.value,
    (newAlbums) => {
      filteredAlbums.value = sortByKey(newAlbums || [], 'albumName', filterState.value.sortOrder);
    },
  );

  watch(
    () => filterState.value,
    () => {
      if (data.value?.length) {
        applyFilters();
      }
    },
    { deep: true },
  );

  const setAlbumToBeUpdated = (album: Album) => (albumToBeUpdate.value = album);
  const setCurrentAlbum = (album: Album) => (currentAlbum.value = album);
  const isAlbumCover = (photoKey: string) => photoKey === currentAlbum.value.albumCover;
  const setSelectedYear = (value: string) => (selectedYear.value = value);
  const setSearchKey = (value: string) => (filterState.value.searchKey = value);
  const setPrivateOnly = (value: boolean) => (filterState.value.privateOnly = value);
  const setSortOrder = (value: 'asc' | 'desc') => (filterState.value.sortOrder = value);
  const setSelectedTags = (value: string[]) => (filterState.value.selectedTags = value);
  const setEnabled = (value: boolean) => (isEnabled.value = value);

  const clearFilters = () => {
    filterState.value = {
      searchKey: '',
      selectedTags: [],
      privateOnly: false,
      sortOrder: 'desc',
    };
  };

  return {
    isFetching,
    isError,
    selectedYear,
    currentAlbum,
    albumToBeUpdate,
    filterState,
    filteredAlbums,
    filteredAlbumsByYear,
    setAlbumToBeUpdated,
    setCurrentAlbum,
    isAlbumCover,
    refetchAlbums,
    setSelectedYear,
    setSearchKey,
    setPrivateOnly,
    setSortOrder,
    setSelectedTags,
    clearFilters,
    setEnabled,
  };
});
