<template>
  <q-dialog
    v-model="dialog"
    maximized
    transition-hide="slide-down"
    transition-show="slide-up"
    @escape-key="closeDialog"
    @keydown.left="nextPhoto(-1)"
    @keydown.right="nextPhoto(1)"
  >
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
                  v-show="!loadImage && selectedImage"
                  :alt="photoFileName"
                  :src="selectedImage?.url"
                  class="rounded-borders-lg responsive-image"
                  style="margin: auto; display: block; max-width: 1080px"
                  @load="loadImage = false"
                />
              </div>
              <q-btn
                class="absolute-right"
                color="primary"
                icon="mdi-chevron-right"
                round
                style="height: 42px"
                unelevated
                data-test-id="next-photo-button"
                @click="nextPhoto(1)"
              />
              <q-btn
                class="absolute-left"
                color="primary"
                icon="mdi-chevron-left"
                round
                style="height: 42px"
                unelevated
                data-test-id="previous-photo-button"
                @click="nextPhoto(-1)"
              />
            </div>
          </div>
          <div class="col-12 col-xl-3 col-lg-3 col-md-3 q-pt-md q-pt-xl-none q-pt-lg-none q-pt-md-none">
            <q-list separator>
              <q-item>
                <q-item-section class="text-h5"> Details</q-item-section>
                <EditPhotoButton
                  v-if="isAdminUser && selectedImage"
                  :photo-key="selectedImage?.key"
                  @refresh-photo-list="$emit('refreshPhotoList')"
                />
              </q-item>
              <q-item v-if="dateTime">
                <q-item-section avatar>
                  <q-icon name="mdi-calendar-today" />
                </q-item-section>

                <q-item-section>
                  <q-item-label>
                    {{ dateTime }}
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-item v-if="exifTags['Image Height'] && exifTags['Image Width']">
                <q-item-section avatar>
                  <q-icon name="mdi-image" />
                </q-item-section>

                <q-item-section>
                  <q-item-label>
                    {{ exifTags['Image Width']?.value }} x {{ exifTags['Image Height']?.value }}
                  </q-item-label>
                  <q-item-label caption>
                    <span> f/{{ aperture }} </span>
                    <span v-if="exifTags.ExposureTime"> | {{ (exifTags.ExposureTime as NumberTag).description }} </span>
                    <span v-if="exifTags.FocalLength"> | {{ (exifTags.FocalLength as NumberTag).description }} </span>
                    <span v-if="exifTags.ISOSpeedRatings">
                      | ISO{{ (exifTags.ISOSpeedRatings as NumberTag).description }}
                    </span>
                    <span> | EV{{ exposureBias }} </span>
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-item v-if="exifTags.Model">
                <q-item-section avatar>
                  <q-icon name="mdi-camera" />
                </q-item-section>

                <q-item-section>
                  <q-item-label>
                    {{ exifTags.Make?.description }} {{ (exifTags.Model as StringArrayTag).value[0] }}
                  </q-item-label>
                  <q-item-label v-if="exifTags.LensModel" caption>
                    {{ (exifTags.LensModel as StringArrayTag).value[0] }}
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-item
                v-if="exifTags.GPSLatitudeRef && exifTags.GPSLongitudeRef && longitude > -1000 && latitude > -1000"
              >
                <q-item-section>
                  <PhotoLocationMap :latitude="latitude" :longitude="longitude" />
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
import EditPhotoButton from 'components/button/EditPhotoButton.vue';
import { ExifData } from 'components/models';
import PhotoLocationMap from 'components/PhotoLocationMap.vue';
import * as ExifReader from 'exifreader';
import { NumberTag, StringArrayTag } from 'exifreader';
import { useQuasar } from 'quasar';
import { isEmpty } from 'radash';
import { photoStore } from 'stores/photo-store';
import { userStore } from 'stores/user-store';
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

defineEmits(['refreshPhotoList']);
const userPermissionStore = userStore();
const usePhotoStore = photoStore();

const q = useQuasar();
const router = useRouter();
const route = useRoute();

const selectedImageIndex = ref(-1);
const photoFileName = ref('');
const exifTags = ref({} as ExifData);
const loadImage = ref(false);

const isAdminUser = computed(() => userPermissionStore.isAdminUser);
const selectedImage = computed(() => usePhotoStore.findPhotoByIndex(selectedImageIndex.value));
const photoList = computed(() => usePhotoStore.photoList);
const fetchingPhotos = computed(() => usePhotoStore.fetchingPhotos);

const albumId = computed(() => route.params.albumId as string);
const photoId = computed(() => route.query.photo as string);
const dialog = computed(() => !isEmpty(photoId.value));

/** Photo EXIF data */
const dateTime = computed(() => {
  if (exifTags.value.DateTime?.description) {
    const dateTime = exifTags.value.DateTime?.description.split(' ');
    const time = dateTime[1].split(':');
    return `${dateTime[0].replaceAll(':', '/')} ${time[0]}:${time[1]} ${exifTags.value.OffsetTime?.value?.[0] ?? ''}`;
  }
  return '';
});

const latitude = computed(() => {
  if (exifTags.value.GPSLatitude?.description) {
    if (exifTags.value.GPSLatitudeRef?.value[0] === 'S') {
      return Number(exifTags.value.GPSLatitude?.description) * -1;
    }
    return Number(exifTags.value.GPSLatitude?.description);
  }
  return -1000;
});

const longitude = computed(() => {
  if (exifTags.value.GPSLongitude?.description) {
    if (exifTags.value.GPSLongitudeRef?.value[0] === 'W') {
      return Number(exifTags.value.GPSLongitude?.description) * -1;
    }
    return Number(exifTags.value.GPSLongitude?.description);
  }
  return -1000;
});

const exposureBias = computed(() => parseFloat(exifTags.value.ExposureBiasValue?.description ?? '0').toFixed(2));

const aperture = computed(() =>
  parseFloat(exifTags.value.ApertureValue?.description ?? exifTags.value.MaxApertureValue?.description ?? '0').toFixed(
    1
  )
);
/** Photo EXIF data */

// When opening photo detail URL directly (Not from album page)
if (photoId.value && photoList.value.length === 0) {
  usePhotoStore.getPhotos(albumId.value);
}

const closeDialog = async () => await router.replace({ query: undefined });

const nextPhoto = (dir: number) => {
  q.loadingBar.start();
  exifTags.value = {};

  const photoListLength = photoList.value.length;
  selectedImageIndex.value = (selectedImageIndex.value + (dir % photoListLength) + photoListLength) % photoListLength;

  if (selectedImage.value) {
    const photoKeyForUrl = selectedImage.value.key.split('/')[1];
    router.replace({ query: { photo: photoKeyForUrl } });
  }
};

watch(
  [photoId, photoList],
  ([newId, newList]) => {
    if (fetchingPhotos.value) return;

    if (newId && newList.length > 0) {
      selectedImageIndex.value = usePhotoStore.findPhotoIndex(newId);
    }

    if (selectedImageIndex.value === -1) {
      q.notify({
        timeout: 2000,
        progress: true,
        color: 'negative',
        icon: 'mdi-alert-circle',
        message: "Photo doesn't exist",
      });
      setTimeout(() => router.push(`/album/${albumId.value}`), 3000);
    }
  },
  { deep: true, immediate: true }
);

watch(
  selectedImage,
  async (newValue) => {
    if (newValue?.key) {
      // Remove album id for displaying photo file name
      photoFileName.value = newValue.key.split('/')[1];
      loadImage.value = true;
      try {
        // Read EXIF data
        exifTags.value = (await ExifReader.load(newValue.url)) as ExifData;
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
