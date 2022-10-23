<template>
  <q-pagination
    v-model="pageNumber"
    :max="totalPages"
    :max-pages="5"
    boundary-links
    boundary-numbers
    direction-links
    active-design='outline'
  />
  <q-select v-model="itemsPerPage" :options="[10, 20, 50]" dense outlined />
  ({{ totalItems }} albums)
</template>

<script lang='ts' setup>
import { ref, toRefs, watch } from 'vue';

const emits = defineEmits(['setPageParams']);
const props = defineProps({
  pageNumberProps: {
    type: Number,
    required: true,
  },
  itemsPerPageProps: {
    type: Number,
    required: true,
  },
  totalPages: {
    type: Number,
    required: true,
  },
  totalItems: {
    type: Number,
    required: true,
  },
});

const { pageNumberProps, itemsPerPageProps } = toRefs(props);

const pageNumber = ref(pageNumberProps.value);
const itemsPerPage = ref(itemsPerPageProps.value);

watch([pageNumberProps, itemsPerPageProps], ([newValue1, newValue2]) => {
  pageNumber.value = newValue1;
  itemsPerPage.value = newValue2;
})

watch([pageNumber, itemsPerPage], ([newValue1, newValue2]) => {
  emits('setPageParams', {pageNumber: newValue1, itemsPerPage: newValue2});
});
</script>

<style scoped>

</style>
