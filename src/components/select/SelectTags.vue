<template>
  <MultiSelect
    v-model="internalSelectedTags"
    :class="extraClass"
    :loading="isFetchingAlbumTags"
    :options="albumTags"
    filter
    option-label="tag"
    option-value="tag"
    placeholder="Album Tag"
    display="chip"
    input-id="select-tags"
  />
</template>

<script lang="ts" setup>
import AlbumTagsContext from '@/composables/album-tags-context';
import MultiSelect from 'primevue/multiselect';
import { ref, toRefs, watch } from 'vue';

const emits = defineEmits(['selectTags']);
const props = defineProps({
  selectedTags: {
    type: Array as () => string[],
    default: () => []
  },
  extraClass: {
    type: String,
    default: ''
  }
});

const { selectedTags } = toRefs(props);
const internalSelectedTags = ref(selectedTags.value);
const { fetchAlbumTags, isFetchingAlbumTags, albumTags } = AlbumTagsContext();

fetchAlbumTags();

watch(
  internalSelectedTags,
  (value) => {
    emits('selectTags', value);
  },
  { immediate: true }
);
</script>
