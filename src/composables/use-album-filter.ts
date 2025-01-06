import type { Album } from '@/schema';
import { sortByKey } from '@/utils/helper';
import { isEmpty } from 'radash';
import { computed, ref, watch } from 'vue';
import useAlbums from './use-albums';

export interface AlbumFilterState {
  searchKey: string;
  selectedTags: string[];
  privateOnly: boolean;
  sortOrder: 'asc' | 'desc';
}

const globalFilterState = ref<AlbumFilterState>({
  searchKey: '',
  selectedTags: [],
  privateOnly: false,
  sortOrder: 'desc'
});

export default function useAlbumFilter() {
  const { albumList } = useAlbums();

  const filteredAlbums = ref<Album[]>([]);

  const applyFilters = () => {
    let result = [...albumList.value];

    if (globalFilterState.value.privateOnly) {
      result = result.filter((album) => album.isPrivate);
    }

    if (globalFilterState.value.searchKey) {
      const searchTerm = globalFilterState.value.searchKey.toLowerCase();
      result = result.filter(
        (album) =>
          album.albumName.toLowerCase().includes(searchTerm) || album.description?.toLowerCase().includes(searchTerm)
      );
    }

    if (!isEmpty(globalFilterState.value.selectedTags)) {
      result = result.filter((album) => globalFilterState.value.selectedTags.some((tag) => album.tags?.includes(tag)));
    }

    filteredAlbums.value = sortByKey(result, 'albumName', globalFilterState.value.sortOrder);
  };

  watch(
    () => albumList.value,
    (newAlbums) => {
      filteredAlbums.value = sortByKey(newAlbums, 'albumName', globalFilterState.value.sortOrder);
    }
  );

  watch(
    () => globalFilterState.value,
    () => {
      if (albumList.value.length) {
        applyFilters();
      }
    },
    { deep: true }
  );

  return {
    filterState: globalFilterState,
    filteredAlbums: computed(() => filteredAlbums.value),

    // Convenience methods for common operations
    setSearchKey: (value: string) => (globalFilterState.value.searchKey = value),
    setPrivateOnly: (value: boolean) => (globalFilterState.value.privateOnly = value),
    setSortOrder: (value: 'asc' | 'desc') => (globalFilterState.value.sortOrder = value),
    setSelectedTags: (value: string[]) => (globalFilterState.value.selectedTags = value),

    // Helper method to clear all filters
    clearFilters: () => {
      globalFilterState.value = {
        searchKey: '',
        selectedTags: [],
        privateOnly: false,
        sortOrder: 'desc'
      };
    }
  };
}
