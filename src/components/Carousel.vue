<template>
  <div class="embla relative-position q-mb-xl-xl q-mb-lg-lg q-mb-md">
    <div ref="emblaRef" class="embla__viewport">
      <div class="embla__container">
        <template v-for="albumItem in featuredAlbums" :key="albumItem.id">
          <div class="embla__slide">
            <div class="relative-position">
              <q-img
                v-if="albumItem['albumCover']"
                :ratio="1"
                :src="`${cdnURL}/${encodeURI(albumItem?.['albumCover'])}?tr=w-200,h-200`"
                class="rounded-borders cursor-pointer"
                :alt="`photo album ${albumItem.albumName}`"
                @click="goToAlbum(albumItem)"
              />
              <div v-else class="no-album-cover-square rounded-borders cursor-pointer" @click="goToAlbum(albumItem)">
                <q-icon class="absolute-center" name="mdi-image" size="48px" />
              </div>
              <div class="absolute-top flex justify-between album-top-container text-white">
                {{ albumItem.albumName }}
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
    <q-btn round unelevated color="accent" icon="mdi-chevron-left" class="absolute-left-centre" @click="scrollPrev" />
    <q-btn round unelevated color="accent" icon="mdi-chevron-right" class="absolute-right-centre" @click="scrollNext" />
    <div class="embla__dots">
      <carousel-dot-button
        v-for="(_, index) in featuredAlbums"
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
import emblaCarouselVue from 'embla-carousel-vue';
import { albumStore } from 'stores/album-store';
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const cdnURL = process.env.IMAGEKIT_CDN_URL as string;
const router = useRouter();
const useAlbumStore = albumStore();
const [emblaRef, emblaApi] = emblaCarouselVue({ loop: true, slidesToScroll: 'auto' });

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
</script>

<style scoped lang="scss">
.album-top-container {
  background: rgba(0, 0, 0, 0.5);
  opacity: 1;
  transition: all 0.5s;
  -webkit-transition: all 0.5s;
  -moz-transition: all 0.5s;
  border-radius: 8px 8px 0 0;
  height: 24px;
  display: flex;
  justify-content: center;
  align-content: center;
}

.embla {
  --slide-height: 15rem;
  --slide-spacing: 0.5rem;
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
  margin-right: calc((2.6rem - 1.4rem) / 2 * -1);
}

.absolute-left-centre {
  top: 40% !important;
}

.absolute-right-centre {
  top: 40% !important;
}
</style>
