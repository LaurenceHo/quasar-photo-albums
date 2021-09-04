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

<script lang="ts">
import { getPhotoObjectFromS3 } from 'components/helper';
import LightBox from 'components/LightBox.vue';
import { LightBoxImage, Photo } from 'components/models';
import { computed, defineComponent, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

export default defineComponent({
  name: 'PhotoList',
  components: {
    LightBox,
  },

  setup() {
    const router = useRouter();
    const route = useRoute();

    const selectedImage = ref('');
    const isLightBoxShowed = ref(false);
    const photosInAlbum = ref([] as Photo[]);
    photosInAlbum.value.push({ url: '', key: '' });

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
      photosInAlbum.value = await getPhotoObjectFromS3(albumName.value, 1000);
    };

    onMounted(() => getPhotoList());

    watch(albumName, (newValue) => {
      if (newValue) {
        getPhotoList();
      }
    });
    return {
      albumName,
      photosInAlbum,
      lightBoxImages,
      isLightBoxShowed,
      selectedImage,
      goBack: () => router.back(),
      showLightBox: (imageUrl: string) => {
        isLightBoxShowed.value = true;
        selectedImage.value = imageUrl;
      },
      hideLightBox: () => (isLightBoxShowed.value = false),
    };
  },
});
</script>
