<template>
  <div class="w-full h-full">
    <div class="flex justify-end">
      <Button class="mb-2" severity="secondary" rounded @click="closeUploader">
        <template #icon>
          <IconX :size="24" />
        </template>
      </Button>
    </div>

    <div class="flex flex-col h-full">
      <DropZone v-slot="{ dropZoneActive }" @files-dropped="addFiles" @valid-drag="isValidDragFn">
        <Message v-if="isCompleteUploading" class="mb-4" severity="success">Upload finished!</Message>

        <div
          v-if="!isCompleteUploading && !isUploading"
          :class="[
            { 'text-xl': isXSmallDevice, 'text-4xl': !isXSmallDevice },
            files.length ? '' : 'flex-1 flex items-center justify-center'
          ]"
          class="font-bold"
        >
          <div class="flex flex-col items-center">
            <span v-if="dropZoneActive" class="flex flex-col items-center mb-2">
              <span>Drop Them Here</span>
              <span v-if="isValidDrag" class="text-base">to add them</span>
              <span v-else class="text-red-600">Only image files allowed</span>
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
        </div>
        <ul v-show="files.length" class="gap-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 mt-4">
          <FilePreview v-for="file of files" :key="file.id" :file="file" tag="li" @remove="removeFile" />
        </ul>
      </DropZone>
    </div>

    <div class="flex justify-center pt-4">
      <Button
        v-if="!isCompleteUploading"
        :disabled="isUploading || validFiles.length === 0"
        class="mr-4"
        data-test-id="clear-file-button"
        label="Clear all"
        outlined
        @click="clearFiles"
      />
      <Button
        v-if="!isCompleteUploading"
        :disabled="isUploading || validFiles.length === 0"
        data-test-id="upload-file-button"
        label="Upload"
        @click="uploadFiles(validFiles)"
      />
      <Button v-if="isCompleteUploading" data-test-id="finish-button" label="Done" @click="finishUploadPhotos" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import DropZone from '@/components/file-uploader/DropZone.vue';
import FilePreview from '@/components/file-uploader/FilePreview.vue';
import DeviceContext from '@/composables/device-context';
import FileListContext from '@/composables/file-list-context';
import FileUploaderContext from '@/composables/file-uploader-context';
import { IconX } from '@tabler/icons-vue';
import Button from 'primevue/button';
import Message from 'primevue/message';
import { computed, ref, toRefs, watch } from 'vue';

const emits = defineEmits(['refreshPhotoList', 'closePhotoUploader']);

const props = defineProps({
  albumId: {
    type: String,
    required: true
  }
});

const { albumId } = toRefs(props);
const { files, addFiles, removeFile } = FileListContext();
const { setIsCompleteUploading, createUploader, isUploading, isCompleteUploading, overwrite } = FileUploaderContext();
const { isXSmallDevice } = DeviceContext();
const { uploadFiles } = createUploader(albumId.value);

const isValidDrag = ref(true);

const validFiles = computed(() => files.value.filter((file) => file.isValidImage === 'y'));

const isValidDragFn = (isValid: boolean) => {
  isValidDrag.value = isValid;
};

const onInputChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files) {
    addFiles([...target.files]);
    target.value = ''; // reset so that selecting the same file again will still cause it to fire this change
  }
};

const clearFiles = () => (files.value = []);

const closeUploader = () => {
  overwrite.value = false;
  clearFiles();
  setIsCompleteUploading(false);
  emits('closePhotoUploader');
};

const finishUploadPhotos = () => {
  emits('refreshPhotoList');
  closeUploader();
};

watch(albumId, (newValue) => {
  if (newValue) {
    clearFiles();
  }
});
</script>
