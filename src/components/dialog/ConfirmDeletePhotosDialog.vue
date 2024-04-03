<template>
  <q-dialog v-model="deletePhotoDialogState" persistent>
    <q-card>
      <q-card-section class="row items-center">
        <q-icon color="primary" name="mdi-alert-circle" size="md" />
        <span class="q-ml-sm text-h6">
          Do you want to delete photo{{ getSelectedPhotoList.length > 1 ? 's' : '' }} as below?
        </span>
      </q-card-section>

      <q-card-section class="q-pt-none scroll" style="max-height: 50vh">
        <div v-for="photoKey in photoKeysArray" :key="photoKey" class="row">{{ photoKey }}</div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn v-close-popup :disable="isProcessing" color="primary" flat label="Cancel" no-caps />
        <q-btn
          :loading="isProcessing"
          color="primary"
          label="Confirm"
          no-caps
          unelevated
          @click="confirmDeletePhotos"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script lang="ts" setup>
import DialogStateComposable from 'src/composables/dialog-state-composable';
import SelectedItemsComposable from 'src/composables/selected-items-composaable';
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
const { deletePhotoDialogState, setDeletePhotoDialogState } = DialogStateComposable();
const { getSelectedPhotoList } = SelectedItemsComposable();

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
