<template>
  <div
    class="border-gray-300 border-dashed border-2 after:content-[''] after:block after:pb-[100%] rounded-md relative"
    :style="size ? `width: ${size}px; height: ${size}px;` : ''"
  >
    <IconPhoto :size="iconSize" class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
  </div>
</template>
<script lang="ts" setup>
import { IconPhoto } from '@tabler/icons-vue';

defineProps({
  size: {
    type: Number,
    default: null,
  },

  iconSize: {
    type: Number,
    default: 48,
  },
});
</script>
