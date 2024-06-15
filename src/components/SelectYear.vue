<template>
  <q-select
    v-model="internalSelectedYear"
    :options="countAlbumsByYear"
    dense
    label="Year"
    outlined
    option-label="year"
    option-value="year"
    emit-value
    :loading="loadingCountAlbumsByYear"
    :class="extraClass"
  >
    <template #option="scope">
      <q-item v-bind="scope.itemProps">
        <q-item-section>
          <q-item-label>{{ scope.opt.year }} ({{ scope.opt.count }})</q-item-label>
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script setup lang="ts">
import { albumStore } from 'stores/album-store';
import { computed, ref, toRefs, watch } from 'vue';

const emits = defineEmits(['selectYear']);
const props = defineProps({
  selectedYear: {
    type: String,
    required: true,
  },
  extraClass: {
    type: String,
    default: '',
  },
});
const { selectedYear } = toRefs(props);

const useAlbumStore = albumStore();

useAlbumStore.getCountAlbumsByYear();

const internalSelectedYear = ref(selectedYear.value);
const loadingCountAlbumsByYear = computed(() => useAlbumStore.loadingCountAlbumsByYear);
const countAlbumsByYear = computed(() => useAlbumStore.countAlbumsByYear);

watch(internalSelectedYear, (value) => {
  emits('selectYear', value);
});
</script>
