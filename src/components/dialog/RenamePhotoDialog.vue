<template>
  <q-dialog v-model="renamePhotoDialogState">
    <q-card style="min-width: 400px">
      <q-card-section>
        <div class="text-h6">Rename Photo</div>
      </q-card-section>

      <q-form @submit.prevent.stop="confirmRenamePhoto">
        <q-card-section class="q-pt-none">
          <q-input
            v-model="newPhotoNameWithoutExtension"
            :error="isExistedPhotoKey"
            :error-message="isExistedPhotoKey ? 'Photo name already exists' : ''"
            :rules="[
              (val: string) => !!val || 'Photo name is required',
              (val: string) =>
                /^[A-Za-z0-9\s.\-_]*$/.test(val) ||
                'Only alphanumeric, space, full stop, underscore and dash are allowed',
            ]"
            :suffix="fileType"
            autofocus
            counter
            label="Photo name"
            maxlength="30"
            outlined
            stack-label
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn v-close-popup :disable="isProcessing" color="primary" flat label="Cancel" no-caps />
          <q-btn
            :disable="
              !newPhotoId || isExistedPhotoKey || newPhotoNameWithoutExtension === currentFileNameWithoutExtension
            "
            :loading="isProcessing"
            color="primary"
            label="Save"
            no-caps
            type="submit"
            unelevated
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>
<script lang="ts" setup>
import { isEmpty } from 'lodash';
import DialogStateComposable from 'src/composables/dialog-state-composable';
import AlbumService from 'src/services/album-service';
import PhotoService from 'src/services/photo-service';
import { albumStore } from 'stores/album-store';
import { photoStore } from 'stores/photo-store';
import { computed, ref, toRefs, watch } from 'vue';

const emits = defineEmits(['refreshPhotoList', 'closePhotoDetailDialog']);
const props = defineProps({
  albumId: {
    type: String,
    required: true,
  },
});
const { albumId } = toRefs(props);
const { setRenamePhotoDialogState, renamePhotoDialogState, getCurrentPhotoToBeRenamed } = DialogStateComposable();
const albumService = new AlbumService();
const photoService = new PhotoService();

const useAlbumStore = albumStore();
const usePhotoStore = photoStore();

const findFileTypeIndex = getCurrentPhotoToBeRenamed.value.lastIndexOf('.');
const fileType = getCurrentPhotoToBeRenamed.value.slice(findFileTypeIndex);
const currentFileNameWithoutExtension = getCurrentPhotoToBeRenamed.value.slice(0, findFileTypeIndex).split('/')[1];

const newPhotoNameWithoutExtension = ref(currentFileNameWithoutExtension || '');
const newPhotoId = computed(() => `${newPhotoNameWithoutExtension.value || ''}${fileType}`);
const isAlbumCover = computed(() => usePhotoStore.isAlbumCover(getCurrentPhotoToBeRenamed.value));
const selectedAlbum = computed(() => usePhotoStore.selectedAlbumItem);

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
    `${newPhotoNameWithoutExtension.value}${fileType}`,
    `${currentFileNameWithoutExtension}${fileType}`
  );
  if (result.code === 200) {
    if (isAlbumCover.value) {
      const albumToBeSubmitted = {
        ...selectedAlbum.value,
        albumCover: `${albumId.value}/${newPhotoNameWithoutExtension.value}${fileType}`,
      };
      const response = await albumService.updateAlbum(albumToBeSubmitted);
      if (response.code === 200) {
        useAlbumStore.updateAlbumCover(albumToBeSubmitted);
      }
    }
    emits('closePhotoDetailDialog');
    emits('refreshPhotoList');
    setRenamePhotoDialogState(false);
  }
  isProcessing.value = false;
};

watch(newPhotoNameWithoutExtension, (value) => {
  if (value) {
    const photoIndex = usePhotoStore.findPhotoIndex(newPhotoId.value);
    // Should not allow duplicate photo name
    isExistedPhotoKey.value = photoIndex !== -1;
  }
});
</script>
