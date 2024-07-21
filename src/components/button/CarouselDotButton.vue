<template>
  <button type="button" :class="dotButtonClasses" @click="scrollTo" />
</template>
<script setup lang="ts">
import { EmblaCarouselType } from 'embla-carousel';
import { computed, onMounted, ref, toRefs, watch } from 'vue';

const props = defineProps({
  carouselApi: {
    type: Object as () => EmblaCarouselType | undefined,
    required: true,
  },
  dotIndex: {
    type: Number,
    required: true,
  },
});

const { dotIndex, carouselApi } = toRefs(props);

const selectedIndex = ref(0);

const dotButtonClasses = computed(() => ({
  embla__dot: true,
  'embla__dot--selected': dotIndex.value === selectedIndex.value,
}));

const onSelect = (carouselApi: EmblaCarouselType) => {
  if (!carouselApi) return;
  selectedIndex.value = carouselApi?.selectedScrollSnap();
};

const scrollTo = () => {
  if (!carouselApi.value) return;
  selectedIndex.value = dotIndex.value;
  carouselApi.value.scrollTo(dotIndex.value);
};

onMounted(() => {
  if (carouselApi.value) {
    onSelect(carouselApi.value);
    carouselApi.value.on('reInit', onSelect).on('select', onSelect);
  }
});

watch(carouselApi, (newVal) => {
  if (!newVal) return;
  onSelect(newVal);
  newVal.on('reInit', onSelect).on('select', onSelect);
});
</script>

<style scoped lang="scss">
.embla__dot {
  -webkit-tap-highlight-color: transparent;
  -webkit-appearance: none;
  appearance: none;
  background-color: transparent;
  touch-action: manipulation;
  text-decoration: none;
  cursor: pointer;
  border: 0;
  padding: 0;
  margin: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}
.embla__dot:after {
  box-shadow: inset 0 0 0 0.2rem #ef6692;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  content: '';
}
.embla__dot--selected:after {
  box-shadow: inset 0 0 0 1rem #ef6692;
}
</style>
