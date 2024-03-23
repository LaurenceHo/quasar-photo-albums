import { Album } from 'src/components/models';
import { computed, ref } from 'vue';

const renamePhotoDialogState = ref(false);
const movePhotoDialogState = ref(false);
const deletePhotoDialogState = ref(false);
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
  order: 0,
  place: null,
} as Album);
const selectedPhotosList = ref([] as string[]);
const currentPhotoToBeRenamed = ref('');

export default function DialogStateComposable() {
  const setCurrentPhotoToBeRenamed = (photoKey: string) => {
    currentPhotoToBeRenamed.value = photoKey;
  };

  const setRenamePhotoDialogState = (state: boolean) => {
    renamePhotoDialogState.value = state;
  };

  const setMovePhotoDialogState = (state: boolean) => {
    movePhotoDialogState.value = state;
  };

  const setSelectedPhotosList = (photos: string[]) => {
    // Max 50 photos
    photos.slice(0, 50);
    selectedPhotosList.value = photos;
  };

  const setDeletePhotoDialogState = (state: boolean) => {
    deletePhotoDialogState.value = state;
  };

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
    getCurrentPhotoToBeRenamed: computed(() => currentPhotoToBeRenamed.value),
    setCurrentPhotoToBeRenamed,
    currentPhotoToBeRenamed,

    getRenamePhotoDialogState: computed(() => renamePhotoDialogState.value),
    setRenamePhotoDialogState,
    renamePhotoDialogState,

    getMovePhotoDialogState: computed(() => movePhotoDialogState.value),
    setMovePhotoDialogState,
    movePhotoDialogState,

    getSelectedPhotoList: computed(() => selectedPhotosList.value),
    setSelectedPhotosList,
    selectedPhotosList,

    getDeletePhotoDialogState: computed(() => deletePhotoDialogState.value),
    setDeletePhotoDialogState,
    deletePhotoDialogState,

    getUploadPhotoDialogState: computed(() => uploadPhotoDialogState.value),
    setUploadPhotoDialogState,

    getAlbumToBeUpdate: computed(() => albumToBeUpdate.value),
    setAlbumToBeUpdated,

    getUpdateAlbumDialogState: computed(() => updateAlbumDialogState.value),
    setUpdateAlbumDialogState,
    updateAlbumDialogState,

    getUpdateAlbumTagsDialogState: computed(() => updateAlbumTagsDialogState.value),
    setUpdateAlbumTagsDialogState,
    updateAlbumTagsDialogState,
  };
}
