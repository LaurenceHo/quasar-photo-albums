<template>
  <div class="w-full h-full">
    <Button class="mb-2" rounded @click="closeDialog">
      <template #icon>
        <IconX :size="24" />
      </template>
    </Button>

    <div class="flex justify-center items-center">
      <DropZone v-slot="{ dropZoneActive }" @files-dropped="addFiles">
        <Message v-if="isCompleteUploading" class="mb-4" severity="success">Upload finished!</Message>

        <div
          v-if="!isCompleteUploading && !isUploading"
          :class="{ 'text-xl': isXSmallDevice, 'text-4xl': !isXSmallDevice }"
          class="font-bold flex flex-col justify-center items-center"
        >
          <span v-if="dropZoneActive" class="flex flex-col items-center mb-2">
            <span>Drop Them Here</span>
            <span class="text-base">to add them</span>
          </span>
          <span v-else class="flex flex-col items-center">
            <span>Drag Your Photos Here</span>
            <span class="text-base my-2">
              or
              <input
                id="file-input"
                accept="image/png, image/jpeg"
                class="hidden"
                multiple
                type="file"
                @change="onInputChange"
              />
              <label class="cursor-pointer underline italic" for="file-input">browse</label>
            </span>
          </span>
          <span class="text-base font-normal">Max file size: 5MB. Only image files allowed</span>
        </div>
        <ul v-show="files.length" class="gap-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 mt-4">
          <FilePreview v-for="file of files" :key="file.id" :file="file" tag="li" @remove="removeFile" />
        </ul>
      </DropZone>
    </div>

    <div class="flex justify-center pt-4">
      <Button
        v-if="!isCompleteUploading"
        :disabled="isUploading || files.length === 0"
        class="mr-4"
        data-test-id="clear-file-button"
        label="Clear all"
        outlined
        @click="clearFiles"
      />
      <Button
        v-if="!isCompleteUploading"
        :disabled="isUploading || files.length === 0"
        data-test-id="upload-file-button"
        label="Upload"
        @click="uploadFiles(files)"
      />
      <Button v-if="isCompleteUploading" data-test-id="finish-button" label="Done" @click="finishUploadPhotos" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import DropZone from '@/components/file-uploader/DropZone.vue';
import FilePreview from '@/components/file-uploader/FilePreview.vue';
import DeviceContext from '@/composables/device-context';
import DialogContext from '@/composables/dialog-context';
import FileListContext from '@/composables/file-list-context';
import FileUploaderContext from '@/composables/file-uploader-context';
import { IconX } from '@tabler/icons-vue';
import Button from 'primevue/button';
import Message from 'primevue/message';
import { toRefs, watch } from 'vue';

const emit = defineEmits(['refreshPhotoList']);

const props = defineProps({
  albumId: {
    type: String,
    required: true
  }
});

const { albumId } = toRefs(props);
const { setUploadPhotoDialogState } = DialogContext();
const { files, addFiles, removeFile } = FileListContext();
const { setIsCompleteUploading, createUploader, isUploading, isCompleteUploading, overwrite } = FileUploaderContext();
const { isXSmallDevice } = DeviceContext();
const { uploadFiles } = createUploader(albumId.value);

const onInputChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files) {
    addFiles([...target.files]);
    target.value = ''; // reset so that selecting the same file again will still cause it to fire this change
  }
};

const clearFiles = () => (files.value = []);

const finishUploadPhotos = () => {
  emit('refreshPhotoList');
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
