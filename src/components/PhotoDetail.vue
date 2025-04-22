<template>
  <div
    tabindex="0"
    @keydown.left="nextPhoto(-1)"
    @keydown.right="nextPhoto(1)"
    @keydown.esc="emits('closePhotoDetail')"
  >
    <div class="flex justify-end">
      <Button
        class="mb-2"
        data-test-id="close-button"
        rounded
        severity="secondary"
        @click="emits('closePhotoDetail')"
      >
        <template #icon>
          <IconX :size="24" />
        </template>
      </Button>
    </div>

    <div class="grid grid-cols-4 gap-3">
      <div class="col-span-4 flex flex-col items-center lg:col-span-3">
        <div class="mb-3 w-full text-center">
          <div data-test-id="photo-file-name">{{ photoFileName }}</div>
          <div data-test-id="photo-index">
            ({{ selectedImageIndex + 1 }}/{{ photosInAlbum.length }})
          </div>
        </div>
        <IconView360Number v-if="isPanoramaPhoto" />
        <div class="relative h-auto min-h-80 w-full sm:min-h-96 lg:h-[calc(80vh-80px)]">
          <div id="photo-image-detail" class="flex h-full items-center justify-center">
            <ProgressSpinner v-if="loadImage" />
            <template v-else>
              <img
                v-if="!isPanoramaPhoto"
                :alt="photoFileName"
                :src="selectedImage?.url || ''"
                :style="imageStyles"
                class="max-h-full rounded-md"
                @load="loadImage = false"
              />
              <PanoramaViewer v-else :imageUrl="selectedImage?.url ?? ''" />
            </template>
          </div>
          <Button
            class="!absolute !top-1/2 !left-0"
            data-test-id="previous-photo-button"
            rounded
            @click="nextPhoto(-1)"
          >
            <template #icon>
              <IconChevronLeft :size="24" />
            </template>
          </Button>
          <Button
            class="!absolute !top-1/2 !right-0"
            data-test-id="next-photo-button"
            rounded
            @click="nextPhoto(1)"
          >
            <template #icon>
              <IconChevronRight :size="24" />
            </template>
          </Button>
        </div>
      </div>
      <div class="col-span-4 mt-3 lg:col-span-1 lg:mt-0">
        <div class="mx-4 flex justify-between">
          <span class="text-semibold text-2xl">Details</span>
          <EditPhotoButton v-if="isAdmin && selectedImage" :photo-key="selectedImage?.key" />
        </div>
        <Divider v-if="localDateTime" />
        <div v-if="localDateTime" class="mx-4 flex items-center">
          <IconCalendarTime :size="24" class="mr-4" />
          <span>{{ localDateTime }}</span>
        </div>
        <Divider v-if="exifTags['Image Height'] && exifTags['Image Width']" />
        <div
          v-if="exifTags['Image Height'] && exifTags['Image Width']"
          class="mx-4 flex items-center"
        >
          <IconPhoto :size="24" class="mr-4" />
          <div>
            <div>
              {{
                isPhotoLandscape || exifTags.Orientation?.value === 0
                  ? `${imageOriginalWidth} x ${imageOriginalHeight}`
                  : `${imageOriginalHeight} x ${imageOriginalWidth}`
              }}
            </div>
            <small class="text-gray-500">
              <span>f/{{ aperture }}</span>
              <span v-if="exifTags.ExposureTime">
                | {{ (exifTags.ExposureTime as RationalTag).description }}
              </span>
              <span v-if="exifTags.FocalLength">
                | {{ (exifTags.FocalLength as RationalTag).description }}
              </span>
              <span v-if="exifTags.ISOSpeedRatings">
                | ISO{{ (exifTags.ISOSpeedRatings as NumberTag).description }}
              </span>
              <span> | EV{{ exposureBias }}</span>
            </small>
          </div>
        </div>
        <Divider v-if="exifTags.Model" />
        <div v-if="exifTags.Model" class="mx-4 flex items-center">
          <IconCamera :size="24" class="mr-4" />
          <div>
            <div>
              {{ exifTags.Make?.description }} {{ (exifTags.Model as StringArrayTag).value[0] }}
            </div>
            <small v-if="exifTags.LensModel" class="text-gray-500">
              {{ (exifTags.LensModel as StringArrayTag).value[0] }}
            </small>
          </div>
        </div>
        <Divider v-if="exifTags.GPSLatitudeRef && exifTags.GPSLongitudeRef" />
        <div
          v-if="
            exifTags.GPSLatitudeRef &&
            exifTags.GPSLongitudeRef &&
            longitude > -1000 &&
            latitude > -1000
          "
          class="mx-4"
        >
          <PhotoLocationMap :latitude="latitude" :longitude="longitude" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { EditPhotoButton } from '@/components/button';
import PanoramaViewer from '@/components/PanoramaViewer.vue';
import PhotoLocationMap from '@/components/PhotoLocationMap.vue';
import useDevice from '@/composables/use-device';
import usePhotos from '@/composables/use-photos';
import useUserConfig from '@/composables/use-user-config';
import {
  IconCalendarTime,
  IconCamera,
  IconChevronLeft,
  IconChevronRight,
  IconPhoto,
  IconView360Number,
  IconX,
} from '@tabler/icons-vue';
import type {
  ExifTags,
  FileTags,
  NumberTag,
  RationalTag,
  StringArrayTag,
  ValueTag,
} from 'exifreader';
import ExifReader from 'exifreader';
import Button from 'primevue/button';
import Divider from 'primevue/divider';
import ProgressSpinner from 'primevue/progressspinner';
import { useToast } from 'primevue/usetoast';
import { computed, type ComputedRef, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

type ExifData = ExifTags &
  FileTags & {
    ProjectionType?: ValueTag;
  };

const emits = defineEmits(['refreshPhotoList', 'closePhotoDetail']);

const toast = useToast();
const router = useRouter();
const route = useRoute();
const { isAdmin } = useUserConfig();
const { photosInAlbum, isFetchingPhotos, findPhotoByIndex, findPhotoIndex } = usePhotos();
const { windowSize } = useDevice();

const selectedImageIndex = ref(-1);
const photoFileName = ref('');
const exifTags = ref<Partial<ExifData>>({});
const loadImage = ref(false);
const imageContainerWidth = ref(0);
const imageContainerHeight = ref(0);

const selectedImage = computed(() => findPhotoByIndex(selectedImageIndex.value));
const albumId = computed(() => route.params['albumId'] as string);
const albumYear = computed(() => route.params['year'] as string);
const photoId = computed(() => route.query['photo'] as string);

/** Compute photo EXIF data begin */
const localDateTime = computed(() => {
  if (exifTags.value.DateTime?.description) {
    const dateTime = exifTags.value.DateTime?.description;
    // Validate format: "YYYY:MM:DD HH:MM:SS"
    if (!/^\d{4}:\d{2}:\d{2} \d{2}:\d{2}:\d{2}$/.test(dateTime)) {
      return null;
    }

    // Convert EXIF date format to ISO format
    const isoDateTime = dateTime.replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3');
    const date = new Date(isoDateTime);

    // Validate parsed date
    if (isNaN(date.getTime())) {
      return null;
    }
    return `${date.toLocaleString()} ${exifTags.value.OffsetTime?.value?.[0] ?? ''}`;
  }
  return null;
});

const latitude: ComputedRef<number> = computed(() => {
  if (exifTags.value.GPSLatitude?.description) {
    if (exifTags.value.GPSLatitudeRef?.value[0] === 'S') {
      return Number(exifTags.value.GPSLatitude?.description) * -1;
    }
    return Number(exifTags.value.GPSLatitude?.description);
  }
  return -1000;
});

const longitude: ComputedRef<number> = computed(() => {
  if (exifTags.value.GPSLongitude?.description) {
    if (exifTags.value.GPSLongitudeRef?.value[0] === 'W') {
      return Number(exifTags.value.GPSLongitude?.description) * -1;
    }
    return Number(exifTags.value.GPSLongitude?.description);
  }
  return -1000;
});

const exposureBias = computed(() =>
  parseFloat(exifTags.value.ExposureBiasValue?.description ?? '0').toFixed(2),
);

const aperture = computed(() =>
  parseFloat(
    exifTags.value.ApertureValue?.description ??
      exifTags.value.MaxApertureValue?.description ??
      '0',
  ).toFixed(1),
);

const imageOriginalWidth = computed(() => Number(exifTags.value['Image Width']?.value ?? 0));
const imageOriginalHeight = computed(() => Number(exifTags.value['Image Height']?.value ?? 0));
const isPhotoLandscape = computed(
  () =>
    (isPanoramaPhoto.value ||
      !exifTags.value.Orientation ||
      exifTags.value.Orientation?.value === 0 ||
      exifTags.value.Orientation?.value === 1 ||
      exifTags.value.Orientation?.value === 3) &&
    imageOriginalWidth.value > imageOriginalHeight.value,
);
const isPanoramaPhoto = computed(() => {
  if (exifTags.value.ProjectionType?.description === 'equirectangular') return true;

  // Check for common 360 camera indicators
  const make = exifTags.value.Make?.description?.toLowerCase() || '';
  const model = exifTags.value.Model?.description?.toLowerCase() || '';

  // Check for common 360 cameras
  const panoramaCameras = [
    { make: 'ricoh', model: 'theta' },
    { make: 'samsung', model: 'gear 360' },
    { make: 'insta360', model: '' },
    { make: 'gopro', model: 'fusion' },
    { make: 'gopro', model: 'max' },
    { make: 'xiaomi', model: 'mijia' },
  ];

  if (
    panoramaCameras.some(
      (camera) =>
        make.includes(camera.make) && (camera.model === '' || model.includes(camera.model)),
    )
  ) {
    return true;
  }

  const fileName = photoFileName.value.toLowerCase();
  return fileName.includes('360') || fileName.includes('pano');
});
/** Compute photo EXIF data end */

/** Compute image display size begin */
const imageStyles = computed(() => {
  const styles = { height: '', width: '' };
  const aspectRatio = imageOriginalWidth.value / imageOriginalHeight.value;

  // Calculate maximum dimensions based on container
  const maxWidth = Math.min(
    imageOriginalWidth.value,
    imageContainerWidth.value > 1080 ? 1080 : imageContainerWidth.value,
  );
  const maxHeight = Math.min(imageOriginalHeight.value, imageContainerHeight.value);

  // For square or landscape images
  if (aspectRatio >= 1) {
    let width = Math.round(maxWidth);
    let height = Math.round(width / aspectRatio);

    // If calculated height exceeds container height, scale based on height instead
    if (height > maxHeight) {
      height = Math.round(maxHeight);
      width = Math.round(height * aspectRatio);
    }
    styles.width = `${width}px`;
    styles.height = `${height}px`;
  }
  // For portrait images
  else {
    let height = Math.round(maxHeight);
    let width = Math.round(height * aspectRatio);

    // If calculated width exceeds max width, scale based on width instead
    if (width > maxWidth) {
      width = Math.round(maxWidth);
      height = Math.round(width / aspectRatio);
    }
    styles.width = `${width}px`;
    styles.height = `${height}px`;
  }

  return styles;
});
/** Compute image display size end */

const nextPhoto = (dir: number) => {
  exifTags.value = {};

  const photoListLength = photosInAlbum.value.length;
  selectedImageIndex.value =
    (selectedImageIndex.value + (dir % photoListLength) + photoListLength) % photoListLength;

  if (selectedImage.value) {
    const photoId = selectedImage.value.key.split('/')[1];
    router.replace({ query: { ...route.query, photo: photoId } });
  }
};

watch(loadImage, () => {
  imageContainerWidth.value = document.getElementById('photo-image-detail')?.clientWidth ?? 0;
  imageContainerHeight.value = document.getElementById('photo-image-detail')?.clientHeight ?? 0;
});

// When photo id changes, verify if it exists first
watch(
  photoId,
  (newId) => {
    if (isFetchingPhotos.value) return;

    if (newId) {
      selectedImageIndex.value = findPhotoIndex(newId);

      if (selectedImageIndex.value === -1) {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Photo does not exist',
          life: 3000,
        });
        setTimeout(() => router.push(`/album/${albumYear.value}/${albumId.value}`), 3000);
      }
    }
  },
  { deep: true, immediate: true },
);

// If photo exists based on URL, get EXIF data from photo
watch(
  selectedImage,
  async (newValue) => {
    if (newValue?.key) {
      // Remove album id for displaying photo file name
      photoFileName.value = newValue.key.split('/')[1] || '';
      loadImage.value = true;
      try {
        // Read EXIF data
        exifTags.value = (await ExifReader.load(newValue.url)) as ExifData;
      } catch (error) {
        console.error(error);
      } finally {
        loadImage.value = false;
      }
    }
  },
  { deep: true, immediate: true },
);
</script>
