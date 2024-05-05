<template>
  <q-dialog v-model="movePhotoDialogState">
    <q-card>
      <q-card-section>
        <div v-if="duplicatedPhotoKeys.length === 0" class="text-h6">
          Move photo{{ getSelectedPhotoList.length > 1 ? 's' : '' }} to another album
        </div>
        <div v-else class="text-h6">
          <q-icon name="mdi-file-alert" color="warning" /> Photo{{ duplicatedPhotoKeys.length > 1 ? 's' : '' }} exist{{
            duplicatedPhotoKeys.length < 2 ? 's' : ''
          }}
          in {{ selectedAlbum }}
        </div>
      </q-card-section>

      <q-card-section v-if="duplicatedPhotoKeys.length === 0" class="q-pt-none">
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

        <template v-else>
          <div v-for="photoKey in duplicatedPhotoKeys" :key="photoKey" class="row">{{ photoKey }}</div>
        </template>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          v-close-popup
          :disable="isProcessing"
          color="primary"
          flat
          :label="duplicatedPhotoKeys.length === 0 ? 'Cancel' : 'Close'"
          no-caps
        />
        <q-btn
          v-if="duplicatedPhotoKeys.length === 0"
          data-test-id="move-photos-button"
          :disable="!selectedAlbum || isProcessing || photoKeysArray.length === 0"
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
import SelectedItemsComposable from 'src/composables/selected-items-composaable';
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
const { setMovePhotoDialogState, movePhotoDialogState } = DialogStateComposable();
const { getSelectedPhotoList } = SelectedItemsComposable();

const photoService = new PhotoService();
const store = albumStore();

const { albumId } = toRefs(props);
const duplicatedPhotoKeys = ref<string[]>([]);
const filteredAlbumsList = ref(store.albumList.filter((album) => album.id !== albumId.value));
const selectedAlbum = ref(filteredAlbumsList.value[0]?.id ?? '');
const isProcessing = ref(false);

const photoKeysArray = computed(
  () =>
    getSelectedPhotoList.value.map((photoKey: string) => {
      const photoKeyArray = photoKey?.split('/');
      return photoKeyArray.length > 1 ? photoKeyArray[1] : photoKeyArray[0];
    }) as string[]
);

const filterAlbums = (input: string, update: any) => {
  if (input === '') {
    update(() => {
      filteredAlbumsList.value = store.albumList.filter((album) => album.id !== albumId.value);
    });
    return;
  }

  update(() => {
    const needle = input.toLowerCase();
    filteredAlbumsList.value = store.albumList.filter(
      (album) => album.albumName.toLowerCase().indexOf(needle) > -1 && album.id !== albumId.value
    );
  });
};

const confirmMovePhotos = async () => {
  isProcessing.value = true;
  const photosInSelectedAlbum = await photoService.getPhotosByAlbumId(selectedAlbum.value);
  const tempDuplicatedPhotoKeys =
    photosInSelectedAlbum.data
      ?.filter((photo) => photoKeysArray.value.includes(photo.key.split('/')[1]))
      .map((photo) => photo.key.split('/')[1]) ?? [];

  let filteredPhotoKeys = photoKeysArray.value;
  // Remove duplicated photos from the list
  if (tempDuplicatedPhotoKeys.length > 0) {
    filteredPhotoKeys = photoKeysArray.value.filter((photoKey) => !tempDuplicatedPhotoKeys.includes(photoKey));
  }
  if (filteredPhotoKeys.length === 0) {
    duplicatedPhotoKeys.value = tempDuplicatedPhotoKeys;
    isProcessing.value = false;
    return;
  }

  const result = await photoService.movePhotos(albumId?.value, selectedAlbum.value, filteredPhotoKeys);
  isProcessing.value = false;
  duplicatedPhotoKeys.value = tempDuplicatedPhotoKeys;

  if (result.code === 200) {
    emits('closePhotoDetailDialog');
    emits('refreshPhotoList');
  }
  if (duplicatedPhotoKeys.value.length === 0) {
    setMovePhotoDialogState(false);
  }
};
</script>
