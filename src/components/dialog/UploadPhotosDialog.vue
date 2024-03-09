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

      <q-card-section>
        <div class="flex justify-center q-pb-md">
          <q-spinner-ios v-if="isUploading" color="secondary" size="3em" />
        </div>
        <div class="full-width" style="height: 80vh">
          <div id="file-upload-container">
            <DropZone #default="{ dropZoneActive }" class="drop-area" @files-dropped="addFiles">
              <label v-if="!isCompleteUploading" for="file-input">
                <span v-if="dropZoneActive">
                  <span>Drop Them Here</span>
                  <span class="smaller">to add them</span>
                </span>
                <span v-else>
                  <span>Drag Your Files Here</span>
                  <span class="smaller">
                    or <strong><em>click here</em></strong> to select files
                  </span>
                </span>
                <input id="file-input" accept="image/png, image/jpeg" multiple type="file" @change="onInputChange" />
              </label>
              <ul v-show="files.length" class="image-list">
                <FilePreview v-for="file of files" :key="file.id" :file="file" tag="li" @remove="removeFile" />
              </ul>
            </DropZone>
            <div class="flex q-pt-lg justify-center">
              <q-btn
                v-if="!isCompleteUploading"
                :disable="isUploading || files.length === 0"
                class="q-mr-md"
                color="primary"
                data-test-id="clear-button"
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
                data-test-id="upload-button"
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
                @click="closeDialog"
              >
                Done
              </q-btn>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import DropZone from 'components/file-uploader/DropZone.vue';
import FilePreview from 'components/file-uploader/FilePreview.vue';
import DialogStateComposable from 'src/composables/dialog-state-composable';
import useFileList from 'src/composables/file-list-composable';
import fileUploader from 'src/composables/file-uploader-composable';
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
const { setIsCompleteUploading, createUploader, isUploading, isCompleteUploading } = fileUploader();
const { uploadFiles } = createUploader(albumId.value);

const onInputChange = (e: any) => {
  addFiles(e.target.files);
  e.target.value = null; // reset so that selecting the same file again will still cause it to fire this change
};

const clearFiles = () => (files.value = []);

const closeDialog = () => {
  clearFiles();
  setIsCompleteUploading(false);
  setUploadPhotoDialogState(false);
};

watch(albumId, (newValue) => {
  if (newValue) {
    clearFiles();
  }
});

watch(isCompleteUploading, (newValue) => {
  if (newValue) {
    emits('refreshPhotoList');
  }
});
</script>
<style lang="scss" scoped>
#file-upload-container {
  text-align: center;
  color: #2c3e50;
  margin: 0 auto;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.drop-area {
  width: 100%;
  max-width: 1080px;
  margin: 0 auto;
  padding: 50px;
  background: #ffffff55;
  border-radius: 8px;
  border: 1px solid #3f82c3;
  transition: 0.2s ease;

  &[data-active='true'] {
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    background: #ffffffcc;
  }
}

label {
  font-size: 36px;
  cursor: pointer;
  display: block;

  span {
    display: block;
  }

  input[type='file']:not(:focus-visible) {
    position: absolute !important;
    width: 1px !important;
    height: 1px !important;
    padding: 0 !important;
    margin: -1px !important;
    overflow: hidden !important;
    clip: rect(0, 0, 0, 0) !important;
    white-space: nowrap !important;
    border: 0 !important;
  }

  .smaller {
    font-size: 16px;
  }
}

.image-list {
  display: flex;
  list-style: none;
  flex-wrap: wrap;
  padding: 0;
}

button {
  cursor: pointer;
}
</style>
