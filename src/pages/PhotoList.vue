<template>
  <q-page class="q-pt-md">
    <div class="row items-center">
      <q-btn unelevated color="primary" icon="mdi-arrow-left" round size="md" @click="goBack" />
      <div class="text-h4 q-py-md q-pl-sm">{{ albumName }}</div>
    </div>
    <div class="q-col-gutter-md row items-start">
      <div v-for="photo in photos" :key="photo.key" class="col-xl-2 col-lg-2 col-md-3 col-sm-4 col-xs-6">
        <q-img
          :ratio="1"
          :src="`${photo.url}?tr=w-250,h-250`"
          class="rounded-borders album-thumbnail"
          @click="showLightBox(photo.url)"
        >
          <div class="absolute-bottom text-center">{{ photo.key }}</div>
        </q-img>
      </div>
    </div>
    <LightBox
      id="screenshot-lightBox"
      ref="lightbox"
      :imageName="selectedImage"
      :images="photoList"
      :timeoutDuration="5000"
      :visible="isLightBoxShowed"
      @hideLightBox="hideLightBox"
    />
  </q-page>
</template>

<script lang="ts">
import { getPhotos } from 'components/helper';
import { LightBoxImage, Photo } from 'components/models';
import { defineComponent } from 'vue';
import LightBox from 'components/LightBox.vue';

export default defineComponent({
  name: 'PhotoList',
  components: {
    LightBox,
  },

  data() {
    const photos: Photo[] = [];
    photos.push({ url: '', key: '' });

    return {
      photos,
      isLightBoxShowed: false,
      selectedImage: '',
    };
  },

  mounted() {
    this.getPhotoList();
  },

  computed: {
    albumName(): string {
      return this.$route.params.albumName as string;
    },

    photoList(): LightBoxImage[] {
      return this.photos.map((photo: Photo) => {
        return {
          name: photo.url,
          alt: photo.key,
        };
      });
    },
  },

  watch: {
    albumName(value) {
      if (value) {
        this.getPhotoList();
      }
    },
  },

  methods: {
    getPhotoList() {
      this.photos = [];
      getPhotos(this.albumName, 1000, (photos: Photo[]) => {
        this.photos = photos;
      });
    },

    goBack() {
      this.$router.back();
    },

    showLightBox(imageUrl: string) {
      this.isLightBoxShowed = true;
      this.selectedImage = imageUrl;
    },

    hideLightBox() {
      this.isLightBoxShowed = false;
    },
  },
});
</script>
