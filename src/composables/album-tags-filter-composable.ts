import { albumStore } from 'src/stores/album-store';
import { ref } from 'vue';

export default function AlbumTagsFilterComposable() {
  const store = albumStore();
  const albumTags = ref(store.albumTags);

  const filterTags = (val: string, update: any) => {
    if (val === '') {
      update(() => {
        albumTags.value = store.albumTags;
      });
      return;
    }

    update(() => {
      const needle = val.toLowerCase();
      albumTags.value = store.albumTags.filter((v) => v.toLowerCase().indexOf(needle) > -1);
    });
  };

  return {
    albumTags,
    filterTags,
  };
}
