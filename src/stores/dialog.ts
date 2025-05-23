import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useDialogStore = defineStore('dialogStore', () => {
  const renamePhotoDialogState = ref(false);
  const movePhotoDialogState = ref(false);
  const deletePhotoDialogState = ref(false);
  const updateAlbumDialogState = ref(false);
  const createAlbumTagDialogState = ref(false);
  const showAlbumTagsDialogState = ref(false);
  const createTravelRecordsDialogState = ref(false);
  const showTravelRecordsDialogState = ref(false);

  const getRenamePhotoDialogState = computed(() => renamePhotoDialogState.value);
  const getMovePhotoDialogState = computed(() => movePhotoDialogState.value);
  const getDeletePhotoDialogState = computed(() => deletePhotoDialogState.value);
  const getUpdateAlbumDialogState = computed(() => updateAlbumDialogState.value);
  const getCreateAlbumTagDialogState = computed(() => createAlbumTagDialogState.value);
  const getShowAlbumTagsDialogState = computed(() => showAlbumTagsDialogState.value);
  const getCreateTravelRecordDialogState = computed(() => createTravelRecordsDialogState.value);
  const getShowTravelRecordDialogState = computed(() => showTravelRecordsDialogState.value);

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

  const setShowAlbumTagsDialogState = (state: boolean) => {
    showAlbumTagsDialogState.value = state;
  };

  const setCreateTravelRecordsDialogState = (state: boolean) => {
    createTravelRecordsDialogState.value = state;
  };

  const setShowTravelRecordsDialogState = (state: boolean) => {
    showTravelRecordsDialogState.value = state;
  };

  return {
    renamePhotoDialogState: getRenamePhotoDialogState,
    movePhotoDialogState: getMovePhotoDialogState,
    deletePhotoDialogState: getDeletePhotoDialogState,
    updateAlbumDialogState: getUpdateAlbumDialogState,

    createAlbumTagDialogState: getCreateAlbumTagDialogState,
    showAlbumTagsDialogState: getShowAlbumTagsDialogState,

    createTravelRecordsDialogState: getCreateTravelRecordDialogState,
    showTravelRecordsDialogState: getShowTravelRecordDialogState,

    setRenamePhotoDialogState,
    setMovePhotoDialogState,
    setDeletePhotoDialogState,
    setUpdateAlbumDialogState,

    setCreateAlbumTagDialogState,
    setShowAlbumTagsDialogState,

    setCreateTravelRecordsDialogState,
    setShowTravelRecordsDialogState,
  };
});
