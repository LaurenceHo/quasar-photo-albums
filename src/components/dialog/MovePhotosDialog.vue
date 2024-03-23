<template>
  <q-dialog v-model="movePhotoDialogState">
    <q-card>
      <q-card-section>
        <div class="text-h6">Move photo{{ getSelectedPhotoList.length > 1 ? 's' : '' }} to another album</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        Select another album for {{ getSelectedPhotoList.length > 1 ? 'these' : 'this' }} photo{{
          getSelectedPhotoList.length > 1 ? 's' : ''
        }}.
        <q-select
          v-model="selectedAlbum"
          :options="filteredAlbumsList"
          clearable
          dense
          emit-value
          input-debounce="0"
          map-options
          option-label="albumName"
          option-value="id"
          outlined
          use-input
          @filter="filterAlbums"
        />
      </q-card-section>

      <q-card-section class="q-pt-none scroll" style="max-height: 50vh">
        <template v-if="duplicatedPhotoKeys.length === 0">
          <div v-for="photoKey in photoKeysArray" :key="photoKey" class="row">
            {{ photoKey }}
          </div>
        </template>

        <template v-if="duplicatedPhotoKeys.length > 0 && !isProcessing">
          <div>
            <q-icon name="mdi-file-alert" color="warning" /> Photo{{
              duplicatedPhotoKeys.length > 1 ? 's' : ''
            }}
            exist{{ duplicatedPhotoKeys.length < 2 ? 's' : '' }} in {{ selectedAlbum }}:
          </div>
          <div v-for="photoKey in duplicatedPhotoKeys" :key="photoKey" class="row">{{ photoKey }}</div>
        </template>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn v-close-popup :disable="isProcessing" color="primary" flat label="Cancel" no-caps />
        <q-btn
          :disable="!selectedAlbum || isProcessing"
          :loading="isProcessing"
          color="primary"
          label="Move"
          no-caps
          unelevated
          @click="confirmMovePhotos"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script lang="ts" setup>
import DialogStateComposable from 'src/composables/dialog-state-composable';
import PhotoService from 'src/services/photo-service';
import { albumStore } from 'stores/album-store';
import { computed, ref, toRefs } from 'vue';

const emits = defineEmits(['refreshPhotoList', 'closePhotoDetailDialog']);
const props = defineProps({
  albumId: {
    type: String,
    required: true,
  },
});
const { albumId } = toRefs(props);
const { getSelectedPhotoList, setMovePhotoDialogState, movePhotoDialogState } = DialogStateComposable();
const photoService = new PhotoService();
const store = albumStore();
const duplicatedPhotoKeys = ref<string[]>([]);
const filteredAlbumsList = ref(store.allAlbumList.filter((album) => album.id !== albumId.value));
const photoKeysArray = computed(
  () =>
    getSelectedPhotoList.value.map((photoKey: string) => {
      const photoKeyArray = photoKey?.split('/');
      return photoKeyArray.length > 1 ? photoKeyArray[1] : photoKeyArray[0];
    }) as string[]
);

const selectedAlbum = ref(filteredAlbumsList.value[0]?.id ?? '');
const isProcessing = ref(false);

const filterAlbums = (input: string, update: any) => {
  if (input === '') {
    update(() => {
      filteredAlbumsList.value = store.allAlbumList.filter((album) => album.id !== albumId.value);
    });
    return;
  }

  update(() => {
    const needle = input.toLowerCase();
    filteredAlbumsList.value = store.allAlbumList.filter(
      (album) => album.albumName.toLowerCase().indexOf(needle) > -1 && album.id !== albumId.value
    );
  });
};

const confirmMovePhotos = async () => {
  isProcessing.value = true;
  const photosInSelectedAlbum = await photoService.getPhotosByAlbumId(selectedAlbum.value);
  duplicatedPhotoKeys.value =
    photosInSelectedAlbum.data
      ?.filter((photo) => photoKeysArray.value.includes(photo.key.split('/')[1]))
      .map((photo) => photo.key.split('/')[1]) ?? [];

  let filteredPhotoKeys = photoKeysArray.value;
  // Remove duplicated photos from the list
  if (duplicatedPhotoKeys.value.length > 0) {
    filteredPhotoKeys = photoKeysArray.value.filter((photoKey) => !duplicatedPhotoKeys.value.includes(photoKey));
  }
  if (filteredPhotoKeys.length === 0) {
    isProcessing.value = false;
    return;
  }

  const result = await photoService.movePhotos(albumId?.value, selectedAlbum.value, filteredPhotoKeys);
  isProcessing.value = false;
  if (result.status === 'Success') {
    emits('closePhotoDetailDialog');
    emits('refreshPhotoList');
  }
  if (duplicatedPhotoKeys.value.length === 0) {
    setMovePhotoDialogState(false);
  }
};
</script>
