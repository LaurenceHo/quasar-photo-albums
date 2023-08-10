import { Album } from 'src/components/models';
import { computed, ref } from 'vue';

const uploadPhotoDialogState = ref(false);
const updateAlbumDialogState = ref(false);
const updateAlbumTagsDialogState = ref(false);
const albumToBeUpdate = ref({
  id: '',
  albumCover: '',
  albumName: '',
  description: '',
  tags: [],
  isPrivate: true,
} as Album);

export default function DialogStateComposable() {
  const setUploadPhotoDialogState = (state: boolean) => {
    uploadPhotoDialogState.value = state;
  };

  const setAlbumToBeUpdated = (album: Album) => {
    albumToBeUpdate.value = album;
  };

  const setUpdateAlbumDialogState = (state: boolean) => {
    updateAlbumDialogState.value = state;
  };

  const setUpdateAlbumTagsDialogState = (state: boolean) => {
    updateAlbumTagsDialogState.value = state;
  };

  return {
    getUploadPhotoDialogState: computed(() => uploadPhotoDialogState.value),
    setUploadPhotoDialogState,
    getAlbumToBeUpdate: computed(() => albumToBeUpdate.value),
    setAlbumToBeUpdated,
    updateAlbumDialogState,
    getUpdateAlbumDialogState: computed(() => updateAlbumDialogState.value),
    setUpdateAlbumDialogState,
    getUpdateAlbumTagsDialogState: computed(() => updateAlbumTagsDialogState.value),
    setUpdateAlbumTagsDialogState,
    updateAlbumTagsDialogState,
  };
}
