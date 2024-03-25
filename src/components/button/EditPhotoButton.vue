<template>
  <q-btn :color="color" flat icon="mdi-dots-vertical" round>
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
        <q-item v-if="!isAlbumCover" v-close-popup clickable @click="makeCoverPhoto">
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
import { Album } from 'components/models';
import { copyToClipboard, useQuasar } from 'quasar';
import DialogStateComposable from 'src/composables/dialog-state-composable';
import { getStaticFileUrl } from 'src/utils/helper';
import AlbumService from 'src/services/album-service';
import { albumStore } from 'stores/album-store';
import { photoStore } from 'stores/photo-store';
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
const usePhotoStore = photoStore();
const q = useQuasar();

const { photoKey } = toRefs(props);

const albumItem = computed(() => usePhotoStore.selectedAlbumItem);
const isAlbumCover = computed(() => usePhotoStore.isAlbumCover(photoKey.value));

const {
  setSelectedPhotosList,
  setDeletePhotoDialogState,
  setMovePhotoDialogState,
  setRenamePhotoDialogState,
  setCurrentPhotoToBeRenamed,
} = DialogStateComposable();

const makeCoverPhoto = async () => {
  const albumToBeSubmitted = { ...(albumItem.value as Album), albumCover: photoKey.value as string };
  const response = await albumService.updateAlbum(albumToBeSubmitted);
  if (response.code === 200) {
    useAlbumStore.updateAlbumCover(albumToBeSubmitted);
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
