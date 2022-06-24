<template>
  <div
    class="drop-zone-container scroll-y"
    :data-active="active"
    @dragenter.prevent="setActive"
    @dragover.prevent="setActive"
    @dragleave.prevent="setInactive"
    @drop.prevent="onDrop"
  >
    <slot :dropZoneActive="active"></slot>
  </div>
</template>

<script lang="ts" setup>
/**
 * https://www.smashingmagazine.com/2022/03/drag-drop-file-uploader-vuejs-3/
 */
import { ref, onMounted, onUnmounted } from 'vue';
const emit = defineEmits(['files-dropped']);

let active = ref(false);
let inActiveTimeout: any = null;

// setActive and setInactive use timeouts, so that when you drag an item over a child element,
// the dragleave event that is fired won't cause a flicker. A few ms should be plenty of
// time to wait for the next dragenter event to clear the timeout and set it back to active.
function setActive() {
  active.value = true;
  clearTimeout(inActiveTimeout);
}

function setInactive() {
  inActiveTimeout = setTimeout(() => {
    active.value = false;
  }, 50);
}

function onDrop(e: any) {
  setInactive();
  emit('files-dropped', [...e.dataTransfer.files]);
}

function preventDefaults(e: any) {
  e.preventDefault();
}

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
