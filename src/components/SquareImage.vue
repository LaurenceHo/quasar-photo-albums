<template>
  <div
    :style="size ? `width: ${size}px; height: ${size}px;` : ''"
    class="relative after:content-[''] after:block after:pb-[100%]"
  >
    <img :id="id" :alt="alt" :src="src" class="rounded-md absolute w-full h-full object-cover" />
  </div>
</template>
<script lang="ts" setup>
defineProps({
  id: {
    type: String,
    default: null
  },
  alt: {
    type: String,
    default: ''
  },
  src: {
    type: String,
    default: '',
    required: true
  },
  size: {
    type: Number,
    default: null
  }
});
</script>
