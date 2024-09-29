import { computed, ref } from 'vue';

const renamePhotoDialogState = ref(false);
const movePhotoDialogState = ref(false);
const deletePhotoDialogState = ref(false);
const uploadPhotoDialogState = ref(false);
const updateAlbumDialogState = ref(false);
const updateAlbumTagsDialogState = ref(false);

export default function DialogContext() {
  const setRenamePhotoDialogState = (state: boolean) => {
    renamePhotoDialogState.value = state;
  };

  const setMovePhotoDialogState = (state: boolean) => {
    movePhotoDialogState.value = state;
  };

  const setDeletePhotoDialogState = (state: boolean) => {
    deletePhotoDialogState.value = state;
  };

  const setUploadPhotoDialogState = (state: boolean) => {
    uploadPhotoDialogState.value = state;
  };

  const setUpdateAlbumDialogState = (state: boolean) => {
    updateAlbumDialogState.value = state;
  };

  const setUpdateAlbumTagsDialogState = (state: boolean) => {
    updateAlbumTagsDialogState.value = state;
  };

  return {
    getRenamePhotoDialogState: computed(() => renamePhotoDialogState.value),
    setRenamePhotoDialogState,
    renamePhotoDialogState,

    getMovePhotoDialogState: computed(() => movePhotoDialogState.value),
    setMovePhotoDialogState,
    movePhotoDialogState,

    getDeletePhotoDialogState: computed(() => deletePhotoDialogState.value),
    setDeletePhotoDialogState,
    deletePhotoDialogState,

    getUploadPhotoDialogState: computed(() => uploadPhotoDialogState.value),
    setUploadPhotoDialogState,

    getUpdateAlbumDialogState: computed(() => updateAlbumDialogState.value),
    setUpdateAlbumDialogState,
    updateAlbumDialogState,

    getUpdateAlbumTagsDialogState: computed(() => updateAlbumTagsDialogState.value),
    setUpdateAlbumTagsDialogState,
    updateAlbumTagsDialogState,
  };
}
