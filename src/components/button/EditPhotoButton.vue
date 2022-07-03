<template>
  <q-btn class="absolute-top-right" color="white" flat icon="mdi-dots-vertical" round>
    <q-menu>
      <q-list style="min-width: 100px">
        <q-item v-if="!isAlbumCover" v-close-popup clickable @click="makeCoverPhoto">
          <q-item-section avatar>
            <q-icon color="primary" name="mdi-image-area" />
          </q-item-section>
          <q-item-section>Make Cover Photo</q-item-section>
        </q-item>
        <q-item v-close-popup clickable @click="copyPhotoLink">
          <q-item-section avatar>
            <q-icon color="primary" name="mdi-link-variant" />
          </q-item-section>
          <q-item-section>Copy Photo Link</q-item-section>
        </q-item>
        <q-item v-close-popup clickable @click="deletePhotoDialog = true">
          <q-item-section avatar>
            <q-icon color="primary" name="mdi-file-image-remove" />
          </q-item-section>
          <q-item-section>Delete photo</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
  <q-dialog v-model="deletePhotoDialog" persistent>
    <q-card>
      <q-card-section class="row items-center">
        <q-icon color="primary" name="mdi-alert-circle" size="md" />
        <span class="q-ml-sm text-h6">Do you want to delete photo "{{ photoKey }}"?</span>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn v-close-popup :disable="isProcessing" color="primary" flat label="Cancel" no-caps />
        <q-btn :loading="isProcessing" color="primary" unelevated label="Confirm" no-caps @click="confirmDeletePhoto" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { getS3Url } from 'components/helper';
import { Album } from 'components/models';
import { copyToClipboard, useQuasar } from 'quasar';
import AlbumService from 'src/services/album-service';
import { albumStore } from 'stores/album-store';
import { ref, toRefs } from 'vue';

const props = defineProps({
  albumItem: {
    type: Object,
    required: true,
    default: () => ({ albumName: '', desc: '', tags: [], private: false, albumCover: '' }),
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
const store = albumStore();
const q = useQuasar();

const deletePhotoDialog = ref(false);
const isProcessing = ref(false);

const makeCoverPhoto = async () => {
  const albumToBeSubmitted = { ...(albumItem.value as Album), albumCover: photoKey.value as string };
  await albumService.updateAlbum(albumToBeSubmitted);
  store.updateAlbumCover(albumToBeSubmitted);
};

const confirmDeletePhoto = () => {
  // TODO
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
