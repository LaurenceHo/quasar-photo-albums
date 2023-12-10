<template>
  <q-dialog v-model="deletePhotoDialogState" persistent>
    <q-card>
      <q-card-section class="row items-center">
        <q-icon color="primary" name="mdi-alert-circle" size="md" />
        <span class="q-ml-sm text-h6"
          >Do you want to delete photo{{ getSelectedPhotoList.length > 1 ? 's' : '' }} as below?</span
        >
      </q-card-section>

      <q-card-section class="q-pt-none">
        <div class="row" v-for="photoKey in photoKeysArray" :key="photoKey">{{ photoKey }}</div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn v-close-popup :disable="isProcessing" color="primary" flat label="Cancel" no-caps />
        <q-btn
          :loading="isProcessing"
          color="primary"
          unelevated
          label="Confirm"
          no-caps
          @click="confirmDeletePhotos"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup lang="ts">
import DialogStateComposable from 'src/composables/dialog-state-composable';
import PhotoService from 'src/services/photo-service';
import { computed, ref, toRefs } from 'vue';

const emits = defineEmits(['refreshPhotoList', 'closePhotoDetailDialog']);
const props = defineProps({
  albumId: {
    type: String,
    required: true,
  },
});

const { albumId } = toRefs(props);
const photoService = new PhotoService();
const { getSelectedPhotoList, deletePhotoDialogState, setDeletePhotoDialogState } = DialogStateComposable();

const photoKeysArray = computed(
  () =>
    getSelectedPhotoList.value.map((photoKey: string) => {
      const photoKeyArray = photoKey?.split('/');
      return photoKeyArray.length > 1 ? photoKeyArray[1] : photoKeyArray[0];
    }) as string[]
);

const isProcessing = ref(false);

const confirmDeletePhotos = async () => {
  isProcessing.value = true;
  const result = await photoService.deletePhotos(albumId?.value, photoKeysArray.value);
  isProcessing.value = false;
  if (result.status === 'Success') {
    emits('closePhotoDetailDialog');
    emits('refreshPhotoList');
  }
  setDeletePhotoDialogState(false);
};
</script>
