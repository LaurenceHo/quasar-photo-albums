<template>
  <q-dialog v-model="dialog" maximized persistent transition-hide="slide-down" transition-show="slide-up">
    <q-card>
      <q-card-section class="row items-center q-pb-none">
        <q-space />
        <q-btn dense flat icon="mdi-close" round @click="closeDialog" />
      </q-card-section>

      <q-card-section>
        <div class="row">
          <div class="col-12 col-xl-9 col-lg-9 col-md-9 column items-center">
            <div class="text-subtitle1 text-grey-7">{{ photoFileName }}</div>
            <div class="text-subtitle1 text-grey-7 q-pb-md">({{ selectedImageIndex + 1 }}/{{ photoList.length }})</div>
            <div class="relative-position full-width image-container">
              <div class="flex justify-center items-center full-height">
                <q-spinner v-show="loadImage" color="primary" size="4rem" />
                <img
                  :alt="photoFileName"
                  v-show="!loadImage"
                  :src="selectedImage.url"
                  class="rounded-borders-lg responsive-image"
                  style="margin: auto; display: block"
                  @load="loadImage = false"
                />
              </div>
              <q-btn
                round
                icon="mdi-chevron-right"
                class="absolute-right"
                color="primary"
                unelevated
                style="height: 42px"
                @click="nextPhoto(1)"
              />
              <q-btn
                round
                icon="mdi-chevron-left"
                class="absolute-left"
                color="primary"
                unelevated
                style="height: 42px"
                @click="nextPhoto(-1)"
              />
            </div>
          </div>
          <div class="col-12 col-xl-3 col-lg-3 col-md-3 q-pt-md q-pt-xl-none q-pt-lg-none q-pt-md-none">
            <q-list separator>
              <q-item>
                <q-item-section class="text-h5"> Details</q-item-section>
                <EditPhotoButton
                  v-if="isAdminUser"
                  :photo-key="selectedImage.key"
                  :album-item="albumItem"
                  :is-album-cover="selectedImage.key === albumItem.albumCover"
                  @refreshPhotoList="$emit('refreshPhotoList')"
                />
              </q-item>
              <q-item v-if="exifTags['Image Height']">
                <q-item-section>
                  <q-item-label>Image Height</q-item-label>
                  <q-item-label caption>{{ exifTags['Image Height'].description }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item v-if="exifTags['Image Width']">
                <q-item-section>
                  <q-item-label>Image Width</q-item-label>
                  <q-item-label caption>{{ exifTags['Image Width'].description }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item v-if="exifTags.Model">
                <q-item-section>
                  <q-item-label>Device</q-item-label>
                  <q-item-label caption>{{ exifTags.Make?.description }}, {{ exifTags.Model.value[0] }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item v-if="exifTags.LensModel">
                <q-item-section>
                  <q-item-label>Lens Model</q-item-label>
                  <q-item-label caption>{{ exifTags.LensModel.value[0] }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item v-if="exifTags.DateTime">
                <q-item-section>
                  <q-item-label>Date Time</q-item-label>
                  <q-item-label caption>{{ exifTags.DateTime.value[0] }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item v-if="exifTags.OffsetTime">
                <q-item-section>
                  <q-item-label>Offset Time</q-item-label>
                  <q-item-label caption>{{ exifTags.OffsetTime.value[0] }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item v-if="exifTags.ShutterSpeedValue">
                <q-item-section>
                  <q-item-label>Shutter Speed</q-item-label>
                  <q-item-label caption>{{ exifTags.ShutterSpeedValue.description }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item v-if="exifTags.ApertureValue">
                <q-item-section>
                  <q-item-label>Aperture</q-item-label>
                  <q-item-label caption>{{ exifTags.ApertureValue.description }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item v-if="exifTags.ExposureBiasValue">
                <q-item-section>
                  <q-item-label>Exposure Bias</q-item-label>
                  <q-item-label caption>{{ exposureBias }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item v-if="exifTags.ISOSpeedRatings">
                <q-item-section>
                  <q-item-label>ISO</q-item-label>
                  <q-item-label caption>{{ exifTags.ISOSpeedRatings.description }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item
                v-if="exifTags.GPSLatitudeRef && exifTags.GPSLongitudeRef && longitude > -1000 && latitude > -1000"
              >
                <q-item-section>
                  <q-item-label class="q-pb-sm">Location</q-item-label>
                  <PhotoLocationMap
                    :latitude="latitude"
                    :longitude="longitude"
                    :latitude-ref="exifTags.GPSLatitudeRef.value[0]"
                    :longitude-ref="exifTags.GPSLongitudeRef.value[0]"
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { isEmpty } from 'lodash';
import EditPhotoButton from 'components/button/EditPhotoButton.vue';
import { getS3Url } from 'components/helper';
import { Photo } from 'components/models';
import PhotoLocationMap from 'components/PhotoLocationMap.vue';
import * as ExifReader from 'exifreader';
import { Tags } from 'exifreader';
import { useQuasar } from 'quasar';
import { photoStore } from 'stores/photo-store';
import { userStore } from 'stores/user-store';
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const userPermissionStore = userStore();
const usePhotoStore = photoStore();
const q = useQuasar();
const router = useRouter();
const route = useRoute();

const isAdminUser = computed(() => userPermissionStore.isAdminUser);
const selectedImageIndex = computed(() => usePhotoStore.selectedImageIndex);
const photoList = computed(() => usePhotoStore.photoList);
const albumItem = computed(() => usePhotoStore.selectedAlbumItem);
const albumId = computed(() => route.params.albumId as string);
const photoId = computed(() => route.query.photo as string);
const dialog = computed(() => !isEmpty(photoId.value));

const selectedImage = ref({ url: '', key: '' } as Photo);
const photoFileName = ref('');
const exifTags = ref({} as Tags);
const loadImage = ref(false);
const latitude = ref(-1000);
const longitude = ref(-1000);

const exposureBias = computed(() =>
  exifTags.value.ExposureBiasValue?.description
    ? parseFloat(exifTags.value.ExposureBiasValue.description).toFixed(2)
    : '1'
);

// When opening photo detail URL directly (Not from album page)
if (photoId.value && photoList.value.length === 0) {
  usePhotoStore.getPhotos(albumId.value);
}

const closeDialog = async () => await router.replace({ query: undefined });

const nextPhoto = (dir: number) => {
  q.loadingBar.start();
  exifTags.value = {};

  const slideLength = photoList.value.length;
  usePhotoStore.$patch({
    selectedImageIndex: (selectedImageIndex.value + (dir % slideLength) + slideLength) % slideLength,
  });
  const nextPhoto = photoList.value[selectedImageIndex.value] as Photo;
  if (nextPhoto) {
    selectedImage.value = nextPhoto;
    const photoKeyForUrl = selectedImage.value.key.split('/')[1];
    router.replace({ query: { photo: photoKeyForUrl } });
  }
};

watch(photoList, (newValue) => {
  if (newValue.length > 0) {
    // Find selected photo index
    const photoIndex = usePhotoStore.findPhotoIndex(photoId.value);
    if (photoIndex > -1) {
      usePhotoStore.$patch({ selectedImageIndex: photoIndex });
    } else {
      q.notify({
        timeout: 2000,
        progress: true,
        color: 'negative',
        icon: 'mdi-alert-circle-outline',
        message: "Photo doesn't exist",
      });
      setTimeout(() => router.push(`/album/${albumId.value}`), 3000);
    }
  }
});

watch(
  selectedImageIndex,
  (newValue) => {
    if (newValue > -1) {
      selectedImage.value = photoList.value[newValue] as Photo;
    }
  },
  { deep: true, immediate: true }
);

watch(
  selectedImage,
  async (newValue) => {
    if (newValue?.key) {
      photoFileName.value = selectedImage.value.key.split('/')[1];
      loadImage.value = true;
      try {
        // Need to load photo from the original source instead of CDN
        exifTags.value = await ExifReader.load(getS3Url(newValue.key) as any);
        if (exifTags.value?.GPSLatitude?.description) {
          latitude.value = Number(exifTags.value.GPSLatitude.description);
        }
        if (exifTags.value?.GPSLongitude?.description) {
          longitude.value = Number(exifTags.value.GPSLongitude.description);
        }
      } catch (error) {
        console.error(error);
      } finally {
        q.loadingBar.stop();
      }
    }
  },
  { deep: true, immediate: true }
);
</script>

<style lang="scss" scoped>
@media only screen and (max-width: 768px) {
  .image-container {
    height: inherit;
  }
}

@media only screen and (min-width: 769px) {
  .image-container {
    height: 80vh;
  }
}

.absolute-left {
  top: 50% !important;
}

.absolute-right {
  top: 50% !important;
}
</style>
