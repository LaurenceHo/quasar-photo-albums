<template>
  <q-page class="q-pt-md">
    <div class="row items-center">
      <q-btn color="primary" icon="mdi-arrow-left" round size="md" unelevated @click="goBack" />
      <div class="text-h4 q-py-md q-pl-sm">{{ albumName }}</div>
    </div>
    <div class="q-col-gutter-md row items-start">
      <div v-for="photo in photosInAlbum" :key="photo.key" class="col-xl-2 col-lg-2 col-md-3 col-sm-4 col-xs-6">
        <q-img
          :ratio="1"
          :src="`${photo.url}?tr=w-250,h-250`"
          class="rounded-borders-lg cursor-pointer"
          @click="showLightBox(photo.url)"
        >
        </q-img>
      </div>
    </div>
    <LightBox
      id="screenshot-lightBox"
      ref="lightbox"
      :imageName="selectedImage"
      :images="lightBoxImages"
      :timeoutDuration="5000"
      :visible="isLightBoxShowed"
      @hideLightBox="hideLightBox"
    />
  </q-page>
</template>

<script lang="ts" setup>
import LightBox from 'components/LightBox.vue';
import { LightBoxImage, Photo } from 'components/models';
import S3Service from 'src/services/s3-service';
import { albumStore } from 'src/store/album-store';
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const s3Service = new S3Service();
const router = useRouter();
const route = useRoute();
const store = albumStore();

const selectedImage = ref('');
const isLightBoxShowed = ref(false);
const photosInAlbum = ref([] as Photo[]);

const albumName = computed(() => route.params.albumName as string);
const lightBoxImages = computed(
  () =>
    photosInAlbum.value.map((photo: Photo) => ({
      name: photo.url,
      alt: photo.key,
    })) as LightBoxImage[]
);

const getPhotoList = async () => {
  photosInAlbum.value = [];
  photosInAlbum.value = await s3Service.getPhotoObject(albumName.value, 1000);
};

const goBack = () => router.back();

const showLightBox = (imageUrl: string) => {
  isLightBoxShowed.value = true;
  selectedImage.value = imageUrl;
};

const hideLightBox = () => (isLightBoxShowed.value = false);

getPhotoList();

watch(albumName, (newValue) => {
  if (newValue) {
    getPhotoList();
  }
});
</script>
