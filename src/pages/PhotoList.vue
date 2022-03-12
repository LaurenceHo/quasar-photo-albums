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
      <div
        v-for="(photo, index) in photosInAlbum"
        :key="photo.key"
        class="col-xl-2 col-lg-2 col-md-3 col-sm-4 col-xs-6"
      >
        <div class="relative-position">
          <q-img
            :ratio="1"
            :src="`${photo.url}?tr=w-250,h-250`"
            class="rounded-borders-lg cursor-pointer"
            @click="showLightBox(index)"
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
    <q-dialog v-model="isLightBoxShowed" maximized persistent transition-hide="slide-down" transition-show="slide-up">
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <q-space />
          <q-btn dense flat icon="mdi-close" round @click="hideLightBox" />
        </q-card-section>

        <q-card-section>
          <div class="row">
            <div class="col-12 col-xl-9 col-lg-9 col-md-9 column items-center">
              <div class="text-subtitle1 text-grey-7 q-pb-md">{{ selectedImage.key }}</div>
              <div class="relative-position">
                <q-btn
                  round
                  icon="mdi-chevron-left"
                  class="absolute-left"
                  color="secondary"
                  unelevated
                  size="sm"
                  style="height: 30px"
                  @click="nextPhoto(-1)"
                />
                <img :src="selectedImage.url" class="rounded-borders-lg responsive-image" />
                <q-btn
                  round
                  icon="mdi-chevron-right"
                  class="absolute-right"
                  color="secondary"
                  unelevated
                  size="sm"
                  style="height: 30px"
                  @click="nextPhoto(1)"
                />
              </div>
            </div>
            <div class="col-12 col-xl-3 col-lg-3 col-md-3">
              <q-list separator>
                <q-item>
                  <q-item-section class="text-h5"> Details </q-item-section>
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
                    <q-item-label caption>{{ exifTags.Model.value[0] }}</q-item-label>
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
  </q-page>
</template>

<script lang="ts" setup>
import { Album, Photo } from 'components/models';
import { copyToClipboard, Notify, useQuasar } from 'quasar';
import S3Service from 'src/services/s3-service';
import { albumStore } from 'src/store/album-store';
import { UserPermission, userStore } from 'src/store/user-store';
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ExifReader from 'exifreader';

const q = useQuasar();
const s3Service = new S3Service();
const router = useRouter();
const route = useRoute();

const store = albumStore();
const userPermissionStore = userStore();

const selectedImageIndex = ref(0);
const selectedImage = ref({ url: '', key: '' } as Photo);
const photosInAlbum = ref([] as Photo[]);
const isLightBoxShowed = ref(false);
const exifTags = ref({});

const userPermission = computed(() => userPermissionStore.userPermission as UserPermission);
const albumId = computed(() => route.params.albumId as string);
const albumItem = computed(() => store.getAlbumById(albumId.value) as Album);

const getPhotoList = async () => {
  photosInAlbum.value = [];
  if (albumItem.value?.id) {
    photosInAlbum.value = await s3Service.getPhotoObject(albumItem.value.id, 1000);
  }
};

const goBack = () => router.back();

const showLightBox = (imageIndex: number) => {
  q.loading.show();
  isLightBoxShowed.value = true;
  selectedImage.value = photosInAlbum.value[imageIndex] as any;
};

const hideLightBox = () => {
  isLightBoxShowed.value = false;
  selectedImage.value = { url: '', key: '' };
  exifTags.value = {};
};

const copyPhotoLink = (photoKey: string) => {
  const photoLink = getS3Url(photoKey);
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

const getS3Url = (photoKey: string): string => {
  let photoLink = `https://s3.amazonaws.com/${process.env.AWS_S3_BUCKET_NAME}/${photoKey}`;
  // Replace space with "+" for retrieving file from S3
  photoLink = photoLink.replace(' ', '+');
  return photoLink;
};

const nextPhoto = (dir: number) => {
  q.loading.show();
  const slideLength = photosInAlbum.value.length;
  selectedImageIndex.value = (selectedImageIndex.value + (dir % slideLength) + slideLength) % slideLength;
  const nextPhoto = photosInAlbum.value[selectedImageIndex.value];
  if (nextPhoto) {
    selectedImage.value = nextPhoto;
  }
};

getPhotoList();

watch(albumId, (newValue) => {
  if (newValue) {
    getPhotoList();
  }
});

watch(
  selectedImage,
  async (newValue) => {
    if (newValue) {
      // Need to load photo from the original source instead of CDN
      exifTags.value = await ExifReader.load(getS3Url(newValue.key) as any);

      delete exifTags.value.MakerNote;
      q.loading.hide();
      selectedImageIndex.value = photosInAlbum.value.findIndex((photo) => photo.key === newValue.key);
    }
  },
  { deep: true, immediate: true }
);
</script>
<style lang="scss" scoped>
.absolute-left {
  top: 50% !important;
}

.absolute-right {
  top: 50% !important;
}
</style>
