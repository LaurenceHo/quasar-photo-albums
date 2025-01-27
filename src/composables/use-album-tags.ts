import type { AlbumTags } from '@/composables/use-albums';
import type { AlbumTag } from '@/schema';
import { AlbumTagService } from '@/services/album-tag-service';
import { compareDbUpdatedTime, fetchDbUpdatedTime, sortByKey } from '@/utils/helper';
import { ALBUM_TAGS } from '@/utils/local-storage-key';
import { get } from 'radash';
import { computed, ref } from 'vue';

const _fetchAlbumTagsAndSetToLocalStorage = async (dbUpdatedTime?: string | null) => {
  let time = dbUpdatedTime;
  if (!time) {
    time = await fetchDbUpdatedTime();
  }

  const { data: tags, code, message } = await AlbumTagService.getAlbumTags();

  if (code !== 200) {
    throw Error(message);
  }

  if (tags) {
    localStorage.setItem(
      ALBUM_TAGS,
      JSON.stringify({
        dbUpdatedTime: time,
        tags: sortByKey(tags, 'tag', 'asc')
      } as AlbumTags)
    );
  }
};

const isFetchingAlbumTags = ref(false);
const albumTags = ref<AlbumTag[]>([]);

export default function useAlbumTags() {
  const fetchAlbumTags = async (forceUpdate = false) => {
    isFetchingAlbumTags.value = true;

    try {
      if (!localStorage.getItem(ALBUM_TAGS)) {
        await _fetchAlbumTagsAndSetToLocalStorage();
      } else {
        const compareResult = await compareDbUpdatedTime(
          get(JSON.parse(localStorage.getItem(ALBUM_TAGS) || '{}') as AlbumTags, 'dbUpdatedTime', null)
        );
        if (forceUpdate || !compareResult.isLatest) {
          await _fetchAlbumTagsAndSetToLocalStorage(compareResult.dbUpdatedTime);
        }
      }

      // Get album tags from local storage again
      albumTags.value = get(
        JSON.parse(localStorage.getItem(ALBUM_TAGS) || '{}') as AlbumTags,
        'tags',
        []
      ) as AlbumTag[];
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      isFetchingAlbumTags.value = false;
      return;
    }
    isFetchingAlbumTags.value = false;
  };

  const getAlbumTags = computed(() => albumTags.value);

  return {
    fetchAlbumTags,
    albumTags: getAlbumTags,
    isFetchingAlbumTags
  };
}
