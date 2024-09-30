import type { AlbumTags } from '@/composables/albums-context';
import type { AlbumTag } from '@/schema';
import { AlbumTagService } from '@/services/album-tag-service';
import { compareDbUpdatedTime, fetchDbUpdatedTime, sortByKey } from '@/utils/helper';
import { ALBUM_TAGS } from '@/utils/local-storage-key';
import { get } from 'radash';
import { computed, ref } from 'vue';

const _fetchAlbumTagsAndSetToLocalStorage = async (dbUpdatedTime?: string) => {
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

export default function AlbumTagsContext() {
  const fetchAlbumTags = async (forceUpdate = false) => {
    isFetchingAlbumTags.value = true;

    try {
      if (!localStorage.getItem(ALBUM_TAGS)) {
        await _fetchAlbumTagsAndSetToLocalStorage();
      } else {
        const compareResult = await compareDbUpdatedTime(
          JSON.parse(<string>localStorage.getItem(ALBUM_TAGS)).dbUpdatedTime
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
