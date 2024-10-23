<!-- In DropZone.vue -->
<template>
  <Card
    :class="`w-full max-w-7xl overflow-auto h-screen max-h-[80vh]
            ${active ? 'shadow-md border-2 border-dashed' : ''}
            ${isValidDrag ? 'border-blue-500' : 'border-red-500'}
            ${isUploading ? 'bg-gray-100' : ''}`"
    :pt="{
      body: {
        style: {
          height: '100%'
        }
      },
      content: {
        style: {
          height: '100%'
        }
      }
    }"
  >
    <template #content>
      <div class="flex flex-col h-full">
        <div class="flex items-center">
          <Checkbox id="overwrite-checkbox" v-model="overwrite" binary class="mr-2" />
          <label for="overwrite-checkbox" class="cursor-pointer">Overwrite existing photos</label>
        </div>

        <Divider class="!mb-0" />
        <ProgressBar v-if="isUploading" class="mb-4 !h-1.5" mode="indeterminate" />

        <div
          class="p-4 flex-1 flex flex-col"
          @dragenter.prevent="setActive"
          @dragover.prevent="onDragOver"
          @dragleave.prevent="setInactive"
          @drop.prevent="onDrop"
        >
          <slot :drop-zone-active="active"></slot>
        </div>
      </div>
    </template>
  </Card>
</template>

<script lang="ts" setup>
import { ALLOWED_FILE_TYPE } from '@/composables/file-list-context';
import FileUploaderContext from '@/composables/file-uploader-context';
import Card from 'primevue/card';
import Divider from 'primevue/divider';
import Checkbox from 'primevue/checkbox';
import ProgressBar from 'primevue/progressbar';
import { onMounted, onUnmounted, ref } from 'vue';

const emits = defineEmits<{
  (e: 'files-dropped', files: File[]): void;
  (e: 'valid-drag', isValid: boolean): void;
}>();

const { overwrite, isUploading } = FileUploaderContext();
const active = ref(false);
const isValidDrag = ref(true);
let inActiveTimeout: number | null = null;

// setActive and setInactive use timeouts, so that when you drag an item over a child element,
// the dragleave event that is fired won't cause a flicker. A few ms should be plenty of
// time to wait for the next dragenter event to clear the timeout and set it back to active.
const setActive = () => {
  active.value = true;
  if (inActiveTimeout !== null) {
    clearTimeout(inActiveTimeout);
  }
};

const setInactive = () => {
  inActiveTimeout = window.setTimeout(() => {
    active.value = false;
  }, 50);
};

const onDragOver = (e: DragEvent) => {
  setActive();
  if (e.dataTransfer?.items) {
    isValidDrag.value = [...e.dataTransfer.items].every((item) => ALLOWED_FILE_TYPE.includes(item.type));

    emits('valid-drag', isValidDrag.value);
  }
};

const onDrop = (e: DragEvent) => {
  setInactive();
  if (e.dataTransfer?.files) {
    const filteredFiles = [...e.dataTransfer.files].filter((file) => ALLOWED_FILE_TYPE.includes(file.type));

    emits('files-dropped', filteredFiles);
  }
};

const preventDefaults = (e: Event) => {
  e.preventDefault();
};

const events = ['dragenter', 'dragover', 'dragleave', 'drop'];

onMounted(() => {
  events.forEach((eventName) => {
    document.body.addEventListener(eventName, preventDefaults);
  });
});

onUnmounted(() => {
  events.forEach((eventName) => {
    document.body.removeEventListener(eventName, preventDefaults);
  });
});
</script>
