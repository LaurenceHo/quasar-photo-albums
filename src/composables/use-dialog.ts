import { computed, ref } from 'vue';

const renamePhotoDialogState = ref(false);
const movePhotoDialogState = ref(false);
const deletePhotoDialogState = ref(false);
const updateAlbumDialogState = ref(false);
const createAlbumTagDialogState = ref(false);
const updateAlbumTagsDialogState = ref(false);

export default function useDialog() {
  const getRenamePhotoDialogState = computed(() => renamePhotoDialogState.value);
  const getMovePhotoDialogState = computed(() => movePhotoDialogState.value);
  const getDeletePhotoDialogState = computed(() => deletePhotoDialogState.value);
  const getUpdateAlbumDialogState = computed(() => updateAlbumDialogState.value);
  const getCreateAlbumTagDialogState = computed(() => createAlbumTagDialogState.value);
  const getUpdateAlbumTagsDialogState = computed(() => updateAlbumTagsDialogState.value);

  const setRenamePhotoDialogState = (state: boolean) => {
    renamePhotoDialogState.value = state;
  };

  const setMovePhotoDialogState = (state: boolean) => {
    movePhotoDialogState.value = state;
  };

  const setDeletePhotoDialogState = (state: boolean) => {
    deletePhotoDialogState.value = state;
  };

  const setUpdateAlbumDialogState = (state: boolean) => {
    updateAlbumDialogState.value = state;
  };

  const setCreateAlbumTagDialogState = (state: boolean) => {
    createAlbumTagDialogState.value = state;
  };

  const setUpdateAlbumTagsDialogState = (state: boolean) => {
    updateAlbumTagsDialogState.value = state;
  };

  return {
    renamePhotoDialogState: getRenamePhotoDialogState,
    movePhotoDialogState: getMovePhotoDialogState,
    deletePhotoDialogState: getDeletePhotoDialogState,
    updateAlbumDialogState: getUpdateAlbumDialogState,
    createAlbumTagDialogState: getCreateAlbumTagDialogState,
    updateAlbumTagsDialogState: getUpdateAlbumTagsDialogState,

    setRenamePhotoDialogState,
    setMovePhotoDialogState,
    setDeletePhotoDialogState,
    setUpdateAlbumDialogState,
    setCreateAlbumTagDialogState,
    setUpdateAlbumTagsDialogState
  };
}
