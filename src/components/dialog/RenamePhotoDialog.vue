<template>
  <q-dialog v-model="renamePhotoDialogState">
    <q-card style="min-width: 400px">
      <q-card-section>
        <div class="text-h6">Rename Photo</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-input
          v-model="newPhotoNameWithoutExtension"
          autofocus
          label="Photo name"
          outlined
          stack-label
          counter
          maxlength="30"
          :error="isExistedPhotoKey"
          :error-message="isExistedPhotoKey ? 'Photo name already exists' : ''"
          :suffix="`.${fileType}`"
          :rules="[
            (val: string) => !!val || 'Photo name is required',
            (val: string) =>
              /^[A-Za-z0-9\s-_]*$/.test(val) || 'Only alphanumeric, space, underscore and dash are allowed',
          ]"
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn v-close-popup :disable="isProcessing" color="primary" flat label="Cancel" no-caps />
        <q-btn
          :loading="isProcessing"
          color="primary"
          unelevated
          label="Save"
          no-caps
          :disable="
            !newPhotoName || isExistedPhotoKey || newPhotoNameWithoutExtension === currentFileNameWithoutExtension
          "
          @click="confirmRenamePhoto"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup lang="ts">
import { isEmpty } from 'lodash';
import DialogStateComposable from 'src/composables/dialog-state-composable';
import PhotoService from 'src/services/photo-service';
import { photoStore } from 'stores/photo-store';
import { computed, ref, toRefs, watch } from 'vue';

const emits = defineEmits(['refreshPhotoList']);
const props = defineProps({
  albumId: {
    type: String,
    required: true,
  },
});
const { albumId } = toRefs(props);
const { setRenamePhotoDialogState, renamePhotoDialogState, getCurrentPhotoToBeRenamed } = DialogStateComposable();
const photoService = new PhotoService();
const store = photoStore();

const fileType = computed(() => getCurrentPhotoToBeRenamed.value.split('.')[1]);
const currentFileNameWithoutExtension = computed(() => getCurrentPhotoToBeRenamed.value.split('.')[0].split('/')[1]);

const newPhotoNameWithoutExtension = ref(currentFileNameWithoutExtension.value || '');
const newPhotoName = computed(() => `${newPhotoNameWithoutExtension.value || ''}.${fileType.value}`);

const isProcessing = ref(false);
const isExistedPhotoKey = ref(false);

const confirmRenamePhoto = async () => {
  newPhotoNameWithoutExtension.value = newPhotoNameWithoutExtension.value.trim();
  if (isEmpty(newPhotoNameWithoutExtension.value)) {
    return;
  }

  isProcessing.value = true;
  const result = await photoService.renamePhoto(
    albumId.value,
    `${newPhotoNameWithoutExtension.value}.${fileType.value}`,
    `${currentFileNameWithoutExtension.value}.${fileType.value}`
  );
  isProcessing.value = false;
  if (result.status === 'Success') {
    emits('refreshPhotoList');
  }
  setRenamePhotoDialogState(false);
};

watch(newPhotoNameWithoutExtension, (value) => {
  if (value) {
    const photoIndex = store.findPhotoIndex(newPhotoName.value);
    // Should not allow duplicate photo name
    isExistedPhotoKey.value = photoIndex !== -1;
  }
});
</script>
