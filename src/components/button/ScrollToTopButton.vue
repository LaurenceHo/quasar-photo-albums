<template>
  <q-page-sticky position="bottom-right" :offset="[18, 18]">
    <Transition>
      <q-btn v-if="showScrollTopButton" round icon="mdi-arrow-up" color="accent" @click="scrollToTop" />
    </Transition>
  </q-page-sticky>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

const showScrollTopButton = ref(false);

const scrollToTop = () => {
  const container = document.getElementById('page-container');
  container?.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
};

const handleScrollToTopButton = () => {
  showScrollTopButton.value = window.scrollY > 0;
};

onMounted(() => {
  window.addEventListener('scroll', handleScrollToTopButton);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScrollToTopButton);
});
</script>

<style lang="scss" scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
