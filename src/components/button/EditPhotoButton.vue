<template>
  <q-btn :color="color" flat icon="mdi-dots-vertical" round data-test-id="edit-photo-button">
    <q-menu>
      <q-list style="min-width: 100px">
        <q-item v-close-popup clickable @click="copyPhotoLink">
          <q-item-section avatar>
            <q-icon color="primary" name="mdi-link-variant" />
          </q-item-section>
          <q-item-section>Copy Link</q-item-section>
        </q-item>
        <q-item v-close-popup clickable @click="deletePhoto">
          <q-item-section avatar>
            <q-icon color="primary" name="mdi-delete" />
          </q-item-section>
          <q-item-section>Delete Photo</q-item-section>
        </q-item>
        <q-item v-close-popup clickable @click="movePhoto">
          <q-item-section avatar>
            <q-icon color="primary" name="mdi-image-move" />
          </q-item-section>
          <q-item-section>Move Photo</q-item-section>
        </q-item>
        <q-item v-close-popup clickable @click="renamePhoto">
          <q-item-section avatar>
            <q-icon color="primary" name="mdi-rename" />
          </q-item-section>
          <q-item-section>Rename Photo</q-item-section>
        </q-item>
        <q-item
          v-if="!isAlbumCover"
          v-close-popup
          clickable
          data-test-id="make-album-cover-button"
          @click="makeCoverPhoto"
        >
          <q-item-section avatar>
            <q-icon color="primary" name="mdi-folder-image" />
          </q-item-section>
          <q-item-section>Make Album Cover</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
</template>

<script lang="ts" setup>
import { copyToClipboard, useQuasar } from 'quasar';
import DialogStateComposable from 'src/composables/dialog-state-composable';
import SelectedItemsComposable from 'src/composables/selected-items-composaable';
import AlbumService from 'src/services/album-service';
import { Album } from 'src/types';
import { getStaticFileUrl } from 'src/utils/helper';
import { albumStore } from 'stores/album-store';
import { computed, toRefs } from 'vue';

const props = defineProps({
  color: {
    type: String,
    default: () => 'black',
  },
  photoKey: {
    type: String,
    required: true,
  },
});

const albumService = new AlbumService();
const useAlbumStore = albumStore();
const q = useQuasar();

const { photoKey } = toRefs(props);

const albumItem = computed(() => useAlbumStore.selectedAlbumItem);
const isAlbumCover = computed(() => useAlbumStore.isAlbumCover(photoKey.value));

const { setDeletePhotoDialogState, setMovePhotoDialogState, setRenamePhotoDialogState } = DialogStateComposable();
const { setSelectedPhotosList, setCurrentPhotoToBeRenamed } = SelectedItemsComposable();

const makeCoverPhoto = async () => {
  const albumToBeUpdated = { ...(albumItem.value as Album), albumCover: photoKey.value as string };
  const response = await albumService.updateAlbum(albumToBeUpdated);
  if (response.code === 200) {
    await useAlbumStore.getAlbumsByYear(albumToBeUpdated.year, true);
    useAlbumStore.$patch({ selectedAlbumItem: albumToBeUpdated });
  }
};

const deletePhoto = () => {
  setSelectedPhotosList([photoKey.value]);
  setDeletePhotoDialogState(true);
};

const movePhoto = () => {
  setSelectedPhotosList([photoKey.value]);
  setMovePhotoDialogState(true);
};

const renamePhoto = () => {
  setCurrentPhotoToBeRenamed(photoKey.value);
  setRenamePhotoDialogState(true);
};

const copyPhotoLink = () => {
  const photoLink = getStaticFileUrl(photoKey.value);
  copyToClipboard(photoLink).then(() => {
    q.notify({
      color: 'white',
      textColor: 'dark',
      message: `<strong>Photo link copied!</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${photoLink}`,
      position: 'top',
      html: true,
      timeout: 3000,
    });
  });
};
</script>
