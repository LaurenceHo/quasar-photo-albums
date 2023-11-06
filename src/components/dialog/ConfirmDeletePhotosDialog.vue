<template>
  <q-dialog v-model="deletePhotoDialogState" persistent>
    <q-card>
      <q-card-section class="row items-center">
        <q-icon color="primary" name="mdi-alert-circle" size="md" />
        <span class="q-ml-sm text-h6">Do you want to delete photo(s) as below?</span>
        <span class="q-mt-sm">{{ photoKeysString }}</span>
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
import { computed, ref, toRefs } from 'vue';
import PhotoService from 'src/services/photo-service';

const emits = defineEmits(['refreshPhotoList']);
const props = defineProps({
  albumId: {
    type: String,
    required: true,
  },

  selectedPhotos: {
    type: Object,
    required: true,
  },
});

const { albumId, selectedPhotos } = toRefs(props);
const photoService = new PhotoService();
const { deletePhotoDialogState, setDeletePhotoDialogState } = DialogStateComposable();

const photoKeysArray = computed(
  () =>
    selectedPhotos.value.map((photoKey: string) => {
      const photoKeyArray = photoKey?.split('/');
      return photoKeyArray.length > 1 ? photoKeyArray[1] : photoKeyArray[0];
    }) as string[]
);

const photoKeysString = computed(() => photoKeysArray.value.join(', '));

const isProcessing = ref(false);

const confirmDeletePhotos = async () => {
  isProcessing.value = true;
  const result = await photoService.deletePhotos(albumId?.value, photoKeysArray.value);
  isProcessing.value = false;
  if (result.status === 'Success') {
    emits('refreshPhotoList');
  }
  setDeletePhotoDialogState(false);
};
</script>
