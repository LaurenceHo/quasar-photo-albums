import type { AlbumTag } from '@/schema';
import { AlbumTagService } from '@/services/album-tag-service';
import {
  compareDbUpdatedTime,
  fetchDbUpdatedTime,
  getDataFromLocalStorage,
  setDataIntoLocalStorage,
  sortByKey,
} from '@/utils/helper';
import { ALBUM_TAGS } from '@/utils/local-storage-key';
import { useQuery, useQueryClient } from '@tanstack/vue-query';
import { defineStore } from 'pinia';

export interface AlbumTags {
  dbUpdatedTime: string;
  tags: AlbumTag[];
}

const _shouldRefetch = async (forceUpdate = false): Promise<boolean> => {
  const stored = getDataFromLocalStorage(ALBUM_TAGS);
  if (!stored) return true;
  if (forceUpdate) return true;
  const { isLatest } = await compareDbUpdatedTime(stored.dbUpdatedTime, 'album');
  return !isLatest;
};

const _fetchAlbumTagsAndSetToLocalStorage = async (
  forceRefetch: boolean = false,
): Promise<AlbumTag[]> => {
  try {
    if (!(await _shouldRefetch(forceRefetch))) {
      const albumTagsWithDBTime = getDataFromLocalStorage(ALBUM_TAGS) as AlbumTags;
      return albumTagsWithDBTime ? albumTagsWithDBTime.tags : [];
    }

    const timeJson = await fetchDbUpdatedTime();
    const { data: tags, code, message } = await AlbumTagService.getAlbumTags();

    if (code !== 200) {
      console.error('Error fetching album tags:', message);
      return [];
    }

    if (tags) {
      setDataIntoLocalStorage(ALBUM_TAGS, {
        dbUpdatedTime: timeJson?.album || '',
        tags: sortByKey(tags, 'tag', 'asc'),
      });
      return tags;
    }

    return [];
  } catch (error) {
    console.error('Error fetching album tags:', error);
    throw error;
  }
};

export const useAlbumTagsStore = defineStore('albumTags', () => {
  const queryClient = useQueryClient();

  const {
    isFetching,
    data,
    isError,
    refetch: refetchQuery,
  } = useQuery({
    queryKey: ['getAlbumTags'],
    queryFn: () => _fetchAlbumTagsAndSetToLocalStorage(false),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 0,
  });

  const refetchAlbumTags = async (forceRefetch = false) => {
    if (forceRefetch) {
      await queryClient.invalidateQueries({ queryKey: ['getAlbumTags'] });
      return queryClient.fetchQuery({
        queryKey: ['getTravelRecords'],
        queryFn: () => _fetchAlbumTagsAndSetToLocalStorage(true),
      });
    }
    return refetchQuery();
  };

  return {
    isFetching,
    isError,
    data,
    refetchAlbumTags,
  };
});
