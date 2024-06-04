<template>
  <q-dialog
    v-model="getUploadPhotoDialogState"
    maximized
    persistent
    transition-hide="slide-down"
    transition-show="slide-up"
  >
    <q-card>
      <q-card-section class="row items-center q-pb-none">
        <q-space />
        <q-btn :disable="isUploading" dense flat icon="mdi-close" round @click="closeDialog" />
      </q-card-section>

      <q-card-section v-if="isUploading" class="flex justify-center">
        <q-spinner-ios color="secondary" size="3em" />
      </q-card-section>
      <q-card-section class="flex column justify-center items-center" style="height: 80vh">
        <DropZone v-slot="{ dropZoneActive }" @files-dropped="addFiles">
          <q-checkbox v-model="overwrite" label="Overwrite existing photos" />
          <div
            v-if="!isCompleteUploading"
            class="text-weight-bold flex justify-center column items-center"
            :class="$q.screen.lt.md ? 'text-h6' : 'text-h4'"
          >
            <span v-if="dropZoneActive" class="flex column items-center">
              <span class="block">Drop Them Here</span>
              <span class="block text-subtitle1">to add them</span>
            </span>
            <span v-else class="flex column items-center">
              <span class="block">Drag Your Photos Here</span>
              <span class="block text-subtitle1">
                or
                <input id="file-input" accept="image/png, image/jpeg" multiple type="file" @change="onInputChange" />
              </span>
            </span>
            <span class="block text-subtitle1"> Max file size: 5MB. Only image files allowed </span>
          </div>
          <ul v-show="files.length" class="flex q-pa-none">
            <FilePreview v-for="file of files" :key="file.id" :file="file" tag="li" @remove="removeFile" />
          </ul>
        </DropZone>
      </q-card-section>
      <q-card-actions align="center">
        <q-btn
          v-if="!isCompleteUploading"
          :disable="isUploading || files.length === 0"
          class="q-mr-md"
          color="primary"
          data-test-id="clear-file-button"
          outline
          padding="sm xl"
          size="lg"
          @click="clearFiles"
        >
          Clear all
        </q-btn>

        <q-btn
          v-if="!isCompleteUploading"
          :disable="isUploading || files.length === 0"
          color="primary"
          data-test-id="upload-file-button"
          padding="sm xl"
          size="lg"
          unelevated
          @click.prevent="uploadFiles(files)"
        >
          Upload
        </q-btn>

        <q-btn
          v-if="isCompleteUploading"
          color="primary"
          data-test-id="finish-button"
          padding="sm xl"
          size="lg"
          unelevated
          @click="finishUploadPhotos"
        >
          Done
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import DropZone from 'components/file-uploader/DropZone.vue';
import FilePreview from 'components/file-uploader/FilePreview.vue';
import DialogStateComposable from 'src/composables/dialog-state-composable';
import useFileList from 'src/composables/file-list-composable';
import useFileUploader from 'src/composables/file-uploader-composable';
import { toRefs, watch } from 'vue';

const emits = defineEmits(['refreshPhotoList']);

const props = defineProps({
  albumId: {
    type: String,
    required: true,
  },
});

const { albumId } = toRefs(props);
const { getUploadPhotoDialogState, setUploadPhotoDialogState } = DialogStateComposable();
const { files, addFiles, removeFile } = useFileList();
const { setIsCompleteUploading, createUploader, isUploading, isCompleteUploading, overwrite } = useFileUploader();
const { uploadFiles } = createUploader(albumId.value);

const onInputChange = (e: any) => {
  addFiles([...e.target.files]);
  e.target.value = null; // reset so that selecting the same file again will still cause it to fire this change
};

const clearFiles = () => (files.value = []);

const finishUploadPhotos = () => {
  emits('refreshPhotoList');
  closeDialog();
};

const closeDialog = () => {
  overwrite.value = false;
  clearFiles();
  setIsCompleteUploading(false);
  setUploadPhotoDialogState(false);
};

watch(albumId, (newValue) => {
  if (newValue) {
    clearFiles();
  }
});
</script>
<style lang="scss" scoped>
#file-input {
  color: rgba(0, 0, 0, 0);
  width: 110px;
}

#file-input::file-selector-button {
  font-weight: 700;
  font-style: italic;
  border: 0;
  padding: 0.2em 0.4em;
  background-color: transparent;
  width: 110px;
}
</style>
