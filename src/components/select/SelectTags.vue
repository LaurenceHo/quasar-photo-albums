<template>
  <Select
    v-model="selectedTag"
    :class="extraClass"
    :is-loading="isFetchingAlbumTags"
    :options="albumTags"
    filter
    option-label="tag"
    option-value="tag"
    placeholder="Album Tag"
    show-clear
  />
</template>

<script lang="ts" setup>
import AlbumTagsContext from '@/composables/album-tags-context';
import Select from 'primevue/select';
import { ref, watch } from 'vue';

const emits = defineEmits(['selectTags']);
defineProps({
  extraClass: {
    type: String,
    default: '',
  },
});

const selectedTag = ref();
const { fetchAlbumTags, isFetchingAlbumTags, albumTags } = AlbumTagsContext();

fetchAlbumTags();

watch(selectedTag, (value) => {
  // TODO - Only support one tag for now
  if (!value) {
    emits('selectTags', []);
    return;
  }
  emits('selectTags', [value]);
});
</script>
