import { Album } from 'components/models';
import { computed, ref } from 'vue';

const updateAlbumDialogState = ref(false);
const albumToBeUpdate = ref({ id: '', albumName: '', desc: '', tags: [], private: false } as Album);

export default function DialogStateComposable() {
  const setAlbumToBeUpdated = (album: Album) => {
    albumToBeUpdate.value = album;
  };

  return {
    getAlbumToBeUpdate: computed(() => albumToBeUpdate.value),
    setAlbumToBeUpdated,
    albumToBeUpdate,
    updateAlbumDialogState,
  };
}
