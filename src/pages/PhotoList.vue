<template>
  <q-page class="q-pt-md">
    <div class="row items-center">
      <q-btn color="primary" icon="mdi-arrow-left" round size="md" unelevated @click="goBack" />
      <div class="text-h4 q-py-md q-pl-sm">
        {{ albumItem?.albumName }} {{ albumItem?.private ? '(private album)' : '' }}
      </div>
    </div>
    <div class="text-h6 text-grey q-pb-lg">{{ albumItem?.desc }}</div>
    <div class="q-col-gutter-md row items-start">
      <div v-for="photo in photosInAlbum" :key="photo.key" class="col-xl-2 col-lg-2 col-md-3 col-sm-4 col-xs-6">
        <div class="relative-position">
          <q-img
            :ratio="1"
            :src="`${photo.url}?tr=w-250,h-250`"
            class="rounded-borders-lg cursor-pointer"
            @click="showLightBox(photo.url)"
          />
          <q-btn
            v-if="userPermission.role === 'admin'"
            class="absolute-top-right"
            color="white"
            flat
            icon="mdi-link-variant"
            round
            @click="copyPhotoLink(photo.key)"
          />
        </div>
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
import { Album, LightBoxImage, Photo } from 'components/models';
import S3Service from 'src/services/s3-service';
import { albumStore } from 'src/store/album-store';
import { UserPermission, userStore } from 'src/store/user-store';
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { copyToClipboard, Notify } from 'quasar';

const s3Service = new S3Service();
const router = useRouter();
const route = useRoute();

const store = albumStore();
const userPermissionStore = userStore();

const selectedImage = ref('');
const isLightBoxShowed = ref(false);
const photosInAlbum = ref([] as Photo[]);

const userPermission = computed(() => userPermissionStore.userPermission as UserPermission);
const albumId = computed(() => route.params.albumId as string);
const albumItem = computed(() => store.getAlbumById(albumId.value) as Album);
const lightBoxImages = computed(
  () =>
    photosInAlbum.value.map((photo: Photo) => ({
      name: photo.url,
      alt: photo.key,
    })) as LightBoxImage[]
);

const getPhotoList = async () => {
  photosInAlbum.value = [];
  if (albumItem.value?.id) {
    photosInAlbum.value = await s3Service.getPhotoObject(albumItem.value.id, 1000);
  }
};

const goBack = () => router.back();

const showLightBox = (imageUrl: string) => {
  isLightBoxShowed.value = true;
  selectedImage.value = imageUrl;
};

const hideLightBox = () => (isLightBoxShowed.value = false);

const copyPhotoLink = (photoKey: string) => {
  let photoLink = `https://s3.amazonaws.com/${process.env.AWS_S3_BUCKET_NAME}/${photoKey}`;
  // Replace space with "+" for retrieving file from S3
  photoLink = photoLink.replace(' ', '+');
  copyToClipboard(photoLink).then(() => {
    Notify.create({
      color: 'white',
      textColor: 'dark',
      message: `<strong>Photo link copied!</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${photoLink}`,
      position: 'top',
      html: true,
      timeout: 3000,
    });
  });
};
getPhotoList();

watch(albumId, (newValue) => {
  if (newValue) {
    getPhotoList();
  }
});
</script>
