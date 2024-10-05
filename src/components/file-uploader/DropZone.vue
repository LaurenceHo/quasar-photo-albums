<template>
  <Card
    :class="[
      'w-full max-w-7xl overflow-auto h-[calc(80vh-80px)]',
      { 'shadow-md border-2 border-dashed border-blue-500': active }
    ]"
  >
    <template #content>
      <div class="flex items-center">
        <Checkbox v-model="overwrite" binary class="mr-2" />
        <span>Overwrite existing photos</span>
      </div>

      <Divider :pt="{ root: { style: { marginBottom: 0 } } }" />
      <!-- TODO: Should show the percentage of upload progress here -->
      <ProgressBar v-if="isUploading" class="mb-4" mode="indeterminate" style="height: 6px" />

      <div
        class="p-4"
        @dragenter.prevent="setActive"
        @dragover.prevent="setActive"
        @dragleave.prevent="setInactive"
        @drop.prevent="onDrop"
      >
        <slot :drop-zone-active="active"></slot>
      </div>
    </template>
  </Card>
</template>

<script lang="ts" setup>
import FileUploaderContext from '@/composables/file-uploader-context';
import Card from 'primevue/card';
import Divider from 'primevue/divider';
import Checkbox from 'primevue/checkbox';
import ProgressBar from 'primevue/progressbar';
import { onMounted, onUnmounted, ref } from 'vue';

const emit = defineEmits<{ (e: 'files-dropped', files: File[]): void }>();

const { overwrite, isUploading } = FileUploaderContext();
const active = ref(false);
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

const onDrop = (e: DragEvent) => {
  setInactive();
  if (e.dataTransfer?.files) {
    emit('files-dropped', [...e.dataTransfer.files]);
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
