<template>
  <Dialog v-model:visible="deletePhotoDialogState" class="w-[450px]" header="Confirm" modal>
    <template #header>
      <div class="flex">
        <IconAlertCircle :size="40" class="text-red-400 pr-2 flex-shrink-0" />
        <span class="text-xl font-semibold" data-test-id="confirm-delete-photos-dialog-title">
          Do you want to delete photo{{ selectedPhotos.length > 1 ? 's' : '' }} as below?
        </span>
      </div>
    </template>
    <div class="max-h-[50vh] overflow-y-auto mb-4">
      <div v-for="photoKey in photoKeysArray" :key="photoKey" class="mb-2">{{ photoKey }}</div>
    </div>
    <template #footer>
      <Button
        :disabled="isPending"
        class="mr-2"
        label="Cancel"
        text
        @click="
          () => {
            reset();
            setDeletePhotoDialogState(true);
          }
        "
      />
      <Button :loading="isPending" autofocus label="Confirm" @click="confirmDeletePhotos" />
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import DialogContext from '@/composables/dialog-context';
import { PhotosContext } from '@/composables/photos-context';
import { PhotoService } from '@/services/photo-service';
import { IconAlertCircle } from '@tabler/icons-vue';
import { useMutation } from '@tanstack/vue-query';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import { useToast } from 'primevue/usetoast';
import { computed, toRefs } from 'vue';

const props = defineProps({
  albumId: {
    type: String,
    required: true
  }
});

const emits = defineEmits(['refreshPhotoList', 'closePhotoDetail']);

const toast = useToast();
const { deletePhotoDialogState, setDeletePhotoDialogState } = DialogContext();
const { selectedPhotos } = PhotosContext();
const { albumId } = toRefs(props);

const photoKeysArray = computed(() =>
  selectedPhotos.value.map((photoKey: string) => {
    const photoKeyArray = photoKey.split('/');
    return photoKeyArray.length > 1 ? photoKeyArray[1] : photoKeyArray[0];
  })
);

const {
  isPending,
  mutate: deletePhoto,
  reset
} = useMutation({
  mutationFn: async () => await PhotoService.deletePhotos(albumId.value, photoKeysArray.value),
  onSuccess: async () => {
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Photos deleted',
      life: 3000
    });
    setTimeout(() => {
      setDeletePhotoDialogState(false);
      emits('closePhotoDetail');
      emits('refreshPhotoList');
    }, 2000);
  },
  onError: () => {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Error while deleting photos. Please try again later.',
      life: 3000
    });
  }
});

const confirmDeletePhotos = (e: MouseEvent) => {
  e.preventDefault();
  deletePhoto();
};
</script>
