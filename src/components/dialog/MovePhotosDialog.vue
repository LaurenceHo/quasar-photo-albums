<template>
  <q-dialog v-model="movePhotoDialogState">
    <q-card style="min-width: 400px">
      <q-card-section>
        <div class="text-h6">Move photo{{getSelectedPhotoList.length > 1 ? 's' : ''}} to another album</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        Select another album for {{getSelectedPhotoList.length > 1 ? 'these':'this'}} photo.
        <q-select
          v-model="selectedAlbum"
          :options="allAlbumsList"
          clearable
          dense
          emit-value
          input-debounce="0"
          option-label="albumName"
          option-value="id"
          outlined
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn v-close-popup :disable="isProcessing" color="primary" flat label="Cancel" no-caps />
        <q-btn
          :loading="isProcessing"
          color="primary"
          unelevated
          label="Move"
          no-caps
          @click="confirmMovePhotos"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup lang="ts">
import DialogStateComposable from 'src/composables/dialog-state-composable';
import { computed, ref, toRefs } from 'vue';
import { albumStore } from 'stores/album-store';
import PhotoService from 'src/services/photo-service';

const emits = defineEmits(['refreshPhotoList']);
const props = defineProps({
  albumId: {
    type: String,
    required: true,
  },
});

const { getSelectedPhotoList, setMovePhotoDialogState, movePhotoDialogState } = DialogStateComposable();
const photoService = new PhotoService();
const store = albumStore();

const allAlbumsList = computed(() => store.allAlbumList);
const photoKeysArray = computed(
  () =>
    getSelectedPhotoList.value.map((photoKey: string) => {
      const photoKeyArray = photoKey?.split('/');
      return photoKeyArray.length > 1 ? photoKeyArray[1] : photoKeyArray[0];
    }) as string[]
);

const { albumId } = toRefs(props);
const selectedAlbum = ref(allAlbumsList.value[0]?.albumName ?? '');
const isProcessing = ref(false);

const confirmMovePhotos = async () => {
  isProcessing.value = true;
  const result = await photoService.movePhotos(albumId?.value, selectedAlbum.value, photoKeysArray.value);
  isProcessing.value = false;
  if (result.status === 'Success') {
    emits('refreshPhotoList');
  }
  setMovePhotoDialogState(false);
}
</script>
