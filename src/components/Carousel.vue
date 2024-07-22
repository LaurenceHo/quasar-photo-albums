<template>
  <div class="embla relative-position q-mb-xl-xl q-mb-lg-lg q-mb-md">
    <div ref="emblaRef" class="embla__viewport">
      <div class="embla__container">
        <template v-for="albumItem in featuredAlbums" :key="albumItem.id">
          <div class="embla__slide" data-test-id="carousel-slide">
            <div class="relative-position">
              <q-img
                v-if="albumItem['albumCover']"
                :ratio="1"
                :src="`${cdnURL}/${encodeURI(albumItem?.['albumCover'])}?tr=w-240,h-240`"
                class="rounded-borders cursor-pointer"
                :alt="`photo album ${albumItem.albumName}`"
                @click="goToAlbum(albumItem)"
              />
              <div v-else class="no-album-cover-square rounded-borders cursor-pointer" @click="goToAlbum(albumItem)">
                <q-icon class="absolute-center" name="mdi-image" size="48px" />
              </div>
              <div class="q-px-sm absolute-top flex justify-between text-white album-top-container ellipsis">
                {{ albumItem.albumName }}
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
    <q-btn
      v-if="!prevBtnDisabled && !nextBtnDisabled"
      round
      unelevated
      color="accent"
      icon="mdi-chevron-left"
      class="absolute-left-centre"
      @click="scrollPrev"
    />
    <q-btn
      v-if="!prevBtnDisabled && !nextBtnDisabled"
      round
      unelevated
      color="accent"
      icon="mdi-chevron-right"
      class="absolute-right-centre"
      @click="scrollNext"
    />
    <div v-if="emblaApi && !prevBtnDisabled && !nextBtnDisabled" class="embla__dots">
      <carousel-dot-button
        v-for="(_, index) in scrollSnaps"
        :key="`dot-button-${index}`"
        :dot-index="index"
        :carousel-api="emblaApi"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import CarouselDotButton from 'components/button/CarouselDotButton.vue';
import { Album } from 'components/models';
import { EmblaCarouselType } from 'embla-carousel';
import emblaCarouselVue from 'embla-carousel-vue';
import { albumStore } from 'stores/album-store';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

const cdnURL = process.env.IMAGEKIT_CDN_URL as string;
const router = useRouter();
const useAlbumStore = albumStore();
const [emblaRef, emblaApi] = emblaCarouselVue({ loop: true, slidesToScroll: 'auto' });

const scrollSnaps = ref<number[]>([]);
const prevBtnDisabled = ref(true);
const nextBtnDisabled = ref(true);

const featuredAlbums = computed(() => useAlbumStore.featuredAlbums);
const goToAlbum = (albumItem: Album) => {
  router.push(`/album/${albumItem?.['year']}/${albumItem?.['id']}`);
};
const scrollPrev = () => {
  if (!emblaApi.value) return;
  emblaApi.value.scrollPrev();
};
const scrollNext = () => {
  if (!emblaApi.value) return;
  emblaApi.value.scrollNext();
};

const onInit = (carouselApi: EmblaCarouselType) => {
  if (!carouselApi) return;
  scrollSnaps.value = carouselApi.scrollSnapList();
};

const onSelect = (carouselApi: EmblaCarouselType) => {
  if (!carouselApi) return;
  prevBtnDisabled.value = !carouselApi?.canScrollPrev();
  nextBtnDisabled.value = !carouselApi?.canScrollNext();
};

watch(emblaApi, (newVal) => {
  if (!newVal) return;
  onInit(newVal);
  onSelect(newVal);
  newVal.on('reInit', onInit).on('reInit', onSelect).on('select', onSelect);
});

onMounted(() => {
  if (emblaApi.value) {
    onInit(emblaApi.value);
    onSelect(emblaApi.value);
    emblaApi.value.on('reInit', onInit).on('reInit', onSelect).on('select', onSelect);
  }
});

onUnmounted(() => {
  if (emblaApi.value) {
    emblaApi.value.destroy();
  }
});
</script>

<style scoped lang="scss">
.album-top-container {
  background: rgba(0, 0, 0, 0.5);
  opacity: 1;
  transition: all 0.5s;
  -webkit-transition: all 0.5s;
  -moz-transition: all 0.5s;
  border-radius: 8px 8px 0 0;
  height: 2rem;
  display: flex;
  align-content: center;
}

.embla {
  --slide-height: 15rem;
  --slide-spacing: 1rem;
}
.embla__viewport {
  overflow: hidden;
  height: var(--slide-height);
}
.embla__container {
  display: flex;
  margin-left: calc(var(--slide-spacing) * -1);
}
.embla__slide {
  flex: 0 0 var(--slide-height);
  min-width: 0;
  padding-left: var(--slide-spacing);
}
.embla__dots {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  margin-right: calc((1rem) / 2 * -1);
}

@media (max-width: 600px) {
  .embla {
    --slide-height: 12rem;
    --slide-spacing: 0.8rem;
  }
}

.absolute-left-centre {
  top: 35% !important;
}

.absolute-right-centre {
  top: 35% !important;
}
</style>
