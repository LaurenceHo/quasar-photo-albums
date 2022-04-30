<template>
  <q-dialog
    v-model="getPhotoDetailDialogState"
    maximized
    persistent
    transition-hide="slide-down"
    transition-show="slide-up"
  >
    <q-card>
      <q-card-section class="row items-center q-pb-none">
        <q-space />
        <q-btn dense flat icon="mdi-close" round @click="hideLightBox" />
      </q-card-section>

      <q-card-section>
        <div class="row">
          <div class="col-12 col-xl-9 col-lg-9 col-md-9 column items-center">
            <div class="text-subtitle1 text-grey-7">{{ selectedImage.key }}</div>
            <div class="text-subtitle1 text-grey-7 q-pb-md">({{ imageIndex + 1 }}/{{ photosInAlbum.length }})</div>
            <div class="relative-position full-width image-container">
              <div class="flex justify-center items-center full-height">
                <q-spinner v-show="loadImage" color="accent" size="4rem" />
                <img
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
                color="accent"
                unelevated
                style="height: 42px"
                @click="nextPhoto(1)"
              />
              <q-btn
                round
                icon="mdi-chevron-left"
                class="absolute-left"
                color="accent"
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
                  <q-item-label caption>{{ exifTags.Make?.description }}, {{ exifTags.Model.value[0] }} </q-item-label>
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
                  <q-item-label caption>{{ exifTags.ExposureBiasValue.description }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item v-if="exifTags.ISOSpeedRatings">
                <q-item-section>
                  <q-item-label>ISO</q-item-label>
                  <q-item-label caption>{{ exifTags.ISOSpeedRatings.description }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item v-if="exifTags.GPSLatitudeRef">
                <q-item-section>
                  <q-item-label>GPS Latitude Ref</q-item-label>
                  <q-item-label caption>{{ exifTags.GPSLatitudeRef.description }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item v-if="exifTags.GPSLatitude">
                <q-item-section>
                  <q-item-label>GPS Latitude</q-item-label>
                  <q-item-label caption>{{ exifTags.GPSLatitude.description }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item v-if="exifTags.GPSLongitudeRef">
                <q-item-section>
                  <q-item-label>GPS Longitude Ref</q-item-label>
                  <q-item-label caption>{{ exifTags.GPSLongitudeRef.description }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item v-if="exifTags.GPSLongitude">
                <q-item-section>
                  <q-item-label>GPS Longitude</q-item-label>
                  <q-item-label caption>{{ exifTags.GPSLongitude.description }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import * as ExifReader from 'exifreader';
import { Photo } from 'src/components/models';
import { useQuasar } from 'quasar';
import DialogStateComposable from 'src/composables/dialog-state-composable';
import { ref, toRefs, watch } from 'vue';
import { getS3Url } from 'src/components/helper';

const props = defineProps({
  photosInAlbum: {
    type: Array,
    required: true,
    default: () => [],
  },
  selectedImageIndex: {
    type: Number,
    required: true,
    default: () => -1,
  },
});

const { selectedImageIndex, photosInAlbum } = toRefs(props);
const { getPhotoDetailDialogState, setPhotoDetailDialogState } = DialogStateComposable();

const q = useQuasar();
const imageIndex = ref(0);
const selectedImage = ref({ url: '', key: '' } as Photo);
const exifTags = ref({});
const loadImage = ref(false);

const nextPhoto = (dir: number) => {
  q.loadingBar.start();
  exifTags.value = {};

  const slideLength = photosInAlbum.value.length;
  imageIndex.value = (imageIndex.value + (dir % slideLength) + slideLength) % slideLength;
  const nextPhoto = photosInAlbum.value[imageIndex.value] as Photo;
  if (nextPhoto) {
    selectedImage.value = nextPhoto;
  }
};

const hideLightBox = () => {
  selectedImage.value = { url: '', key: '' };
  exifTags.value = {};
  setPhotoDetailDialogState(false);
};

watch(
  selectedImageIndex,
  (newValue) => {
    if (newValue > -1) {
      imageIndex.value = newValue;
      selectedImage.value = photosInAlbum.value[newValue] as Photo;
    }
  },
  { deep: true, immediate: true }
);

watch(
  selectedImage,
  async (newValue) => {
    if (newValue?.key) {
      loadImage.value = true;
      try {
        // Need to load photo from the original source instead of CDN
        exifTags.value = await ExifReader.load(getS3Url(newValue.key) as any);
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
