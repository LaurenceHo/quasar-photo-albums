<template>
  <q-btn :color="color" flat icon="mdi-dots-vertical" round>
    <q-menu>
      <q-list style="min-width: 100px">
        <q-item v-close-popup clickable @click="copyPhotoLink">
          <q-item-section avatar>
            <q-icon color="primary" name="mdi-link-variant" />
          </q-item-section>
          <q-item-section>Copy Image Link</q-item-section>
        </q-item>
        <q-item v-close-popup clickable @click="deletePhoto">
          <q-item-section avatar>
            <q-icon color="primary" name="mdi-delete" />
          </q-item-section>
          <q-item-section>Delete Photo</q-item-section>
        </q-item>
        <q-item v-if="!isAlbumCover" v-close-popup clickable @click="makeCoverPhoto">
          <q-item-section avatar>
            <q-icon color="primary" name="mdi-image-area" />
          </q-item-section>
          <q-item-section>Make Cover Photo</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
</template>

<script setup lang="ts">
import { getS3Url } from 'src/helper';
import { Album } from 'components/models';
import { copyToClipboard, useQuasar } from 'quasar';
import AlbumService from 'src/services/album-service';
import PhotoService from 'src/services/photo-service';
import { albumStore } from 'stores/album-store';
import { toRefs } from 'vue';
import DialogStateComposable from 'src/composables/dialog-state-composable';

const emits = defineEmits(['refreshPhotoList']);
const props = defineProps({
  color: {
    type: String,
    default: () => 'black',
  },
  albumItem: {
    type: Object,
    required: true,
    default: () =>
      ({ id: '', albumName: '', description: '', tags: [], isPrivate: false, albumCover: '', order: 0 }) as Album,
  },
  photoKey: {
    type: String,
    required: true,
  },
  isAlbumCover: {
    type: Boolean,
    default: false,
  },
});

const { photoKey, albumItem } = toRefs(props);

const albumService = new AlbumService();
const photoService = new PhotoService();
const store = albumStore();
const q = useQuasar();

const { setSelectedPhotosList, setDeletePhotoDialogState } = DialogStateComposable();

const makeCoverPhoto = async () => {
  const albumToBeSubmitted = { ...(albumItem.value as Album), albumCover: photoKey.value as string };
  await albumService.updateAlbum(albumToBeSubmitted);
  store.updateAlbumCover(albumToBeSubmitted);
};

const deletePhoto = () => {
  setSelectedPhotosList([photoKey.value]);
  setDeletePhotoDialogState(true);
};

const copyPhotoLink = () => {
  const photoLink = getS3Url(photoKey.value);
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
