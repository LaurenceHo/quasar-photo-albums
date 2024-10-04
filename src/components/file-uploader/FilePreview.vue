<template>
  <component :is="tag" class="file-preview relative overflow-hidden col-12 sm:col-6 md:col-4 lg:col-3 xl:col-2">
    <div>{{ fileSize }}</div>
    <div class="relative">
      <img v-if="isValidImageFile" :alt="file.file.name" :src="file.url" />
      <div v-else>
        <div>This file is not allowed:</div>
        <strong>{{ file.file.name }}</strong>
      </div>
      <Button
        v-if="file.status !== true && !file.exists"
        :disabled="file.status === 'loading'"
        :pt="{
          root: {
            style: {
              position: 'absolute',
              top: '0.3rem',
              right: '0.3rem',
              padding: 0,
              height: '1.2rem',
              width: '1.2rem'
            }
          }
        }"
        raised
        rounded
        severity="danger"
        size="small"
        @click="$emit('remove', file)"
      >
        <template #icon>
          <IconX :size="12" />
        </template>
      </Button>

      <FileStatusTag :file="file" />
    </div>
  </component>
</template>

<script lang="ts" setup>
import FileStatusTag from '@/components/file-uploader/FileStatusTag.vue';
import type { UploadFile as IUploadFile } from '@/schema';
import { IconX } from '@tabler/icons-vue';
import Button from 'primevue/button';
import { computed, toRefs } from 'vue';

defineEmits<{ (e: 'remove', file: IUploadFile): void }>();

const props = defineProps({
  file: { type: Object as () => IUploadFile, required: true },
  tag: { type: String, default: 'li' }
});

const { file } = toRefs(props);

const fileSize = computed(() => {
  const size = file.value.file.size / 1024;
  return size < 1024 ? `${size.toFixed(2)} KB` : `${(size / 1024).toFixed(2)} MB`;
});

const isValidImageFile = computed(() => {
  const fileSize = file.value.file.size / 1024 / 1024;
  return file.value.id.includes('image') && fileSize < 5;
});
</script>
