<template>
  <component :is="tag" class="file-preview relative-position overflow-hidden q-mx-lg q-my-md">
    <div class="relative-position">
      <q-img v-if="isValidImageFile" :alt="file.file.name" :src="file.url" :title="file.file.name" ratio="1" />
      <div v-else>
        This file is not allowed <strong>{{ file.file.name }}</strong>
      </div>
      <q-btn
        v-if="file.status !== true && !file.exists"
        :disabled="file.status === 'loading'"
        round
        dense
        size="xs"
        color="negative"
        icon="mdi-close"
        class="absolute-top-right"
        @click="$emit('remove', file)"
      />
      <div class="absolute-bottom-right">
        <q-chip v-if="file.status === 'loading'" dense icon="mdi-progress-upload" class="loading-indicator">
          Uploading
        </q-chip>
        <q-chip v-else-if="file.status === true" dense color="positive" icon="mdi-check" text-color="white">
          Uploaded
        </q-chip>
        <q-chip
          v-else-if="file.status === false && !file.exists"
          dense
          color="negative"
          icon="mdi-alert-circle"
          text-color="white"
        >
          Error
        </q-chip>
        <q-chip v-else-if="file.status === false && file.exists" dense icon="mdi-file-alert" color="warning">
          File exists
        </q-chip>
      </div>
    </div>
  </component>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue';

defineEmits(['remove']);
const props = defineProps({
  file: { type: Object, required: true },
  tag: { type: String, default: 'li' },
});
const { file } = toRefs(props);

const isValidImageFile = computed(() => {
  const fileSize = file.value.file.size / 1024 / 1024;
  return file.value.id.includes('image') && fileSize < 10;
});
</script>

<style lang="scss" scoped>
.file-preview {
  width: 20%;

  button {
    top: 4px;
    right: 4px;
  }

  .loading-indicator {
    animation: pulse 1.5s linear 0s infinite;
    color: #000;
  }
}

@keyframes pulse {
  0% {
    background: #fff;
  }
  50% {
    background: #ddd;
  }
  100% {
    background: #fff;
  }
}
</style>
