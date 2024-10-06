<template>
  <MultiSelect
    v-model="selectedTag"
    :class="extraClass"
    :loading="isFetchingAlbumTags"
    :options="albumTags"
    filter
    option-label="tag"
    option-value="tag"
    placeholder="Album Tag"
    display="chip"
  />
</template>

<script lang="ts" setup>
import AlbumTagsContext from '@/composables/album-tags-context';
import MultiSelect from 'primevue/multiselect';
import { ref, watch } from 'vue';

const emits = defineEmits(['selectTags']);
defineProps({
  extraClass: {
    type: String,
    default: ''
  }
});

const selectedTag = ref();
const { fetchAlbumTags, isFetchingAlbumTags, albumTags } = AlbumTagsContext();

fetchAlbumTags();

watch(
  selectedTag,
  (value) => {
    emits('selectTags', value);
  },
  { immediate: true }
);
</script>
