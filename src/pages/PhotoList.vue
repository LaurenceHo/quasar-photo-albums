<template>
  <div class="q-pt-md">
    <div class="row items-center">
      <q-btn color="primary" icon="mdi-arrow-left" round size="md" unelevated to="/" />
      <div class="text-h4 q-py-md q-pl-sm" data-test-id="album-name">
        {{ albumItem?.albumName }} {{ albumItem?.private ? '(private album)' : '' }}
      </div>
    </div>
    <div class="text-h6 text-grey q-pb-md" data-test-id="album-desc">{{ albumItem?.desc }}</div>
    <div v-if="albumItem?.tags?.length > 0" class="flex q-pb-md">
      <q-chip v-for="(tag, i) in albumItem.tags" :key="i" data-test-id="album-tag" color="secondary">
        {{ tag }}
      </q-chip>
    </div>
    <div class="q-col-gutter-md row">
      <div v-if="isAdminUser" class="col-xl-2 col-lg-2 col-md-3 col-sm-4 col-xs-6" data-test-id="add-photo-item">
        <div class="relative-position">
          <div class="no-album-cover-square rounded-borders-lg cursor-pointer" @click="setUploadPhotoDialogState(true)">
            <q-icon class="absolute-center" name="mdi-image-plus" size="48px" color="black" />
          </div>
        </div>
      </div>
      <template v-if="photosInAlbum.length > 0">
        <div
          v-for="(photo, index) in photosInAlbum"
          :key="photo.key"
          class="col-xl-2 col-lg-2 col-md-3 col-sm-4 col-xs-6"
          data-test-id="photo-item"
        >
          <div class="relative-position">
            <q-img
              :ratio="1"
              :src="`${photo.url}?tr=w-250,h-250`"
              class="rounded-borders-lg cursor-pointer"
              @click="showLightBox(index)"
            />
            <EditPhotoButton
              v-if="isAdminUser"
              :photo-key="photo.key"
              :album-item="albumItem"
              :is-album-cover="photo.key === albumItem.albumCover"
              @refreshPhotoList="getPhotoList"
              color="white"
            />
          </div>
        </div>
      </template>
    </div>
  </div>
  <PhotoDetailDialog
    v-if="getPhotoDetailDialogState"
    :photos-in-album="photosInAlbum"
    :selected-image-index="selectedImageIndex"
    :album-item="albumItem"
    @refreshPhotoList="getPhotoList"
  />
  <UploadPhotosDialog v-if="getUploadPhotoDialogState" :album-id="albumItem.id" @refreshPhotoList="getPhotoList" />
</template>

<script lang="ts" setup>
import EditPhotoButton from 'components/button/EditPhotoButton.vue';
import PhotoDetailDialog from 'components/dialog/PhotoDetailDialog.vue';
import UploadPhotosDialog from 'components/dialog/UploadPhotosDialog.vue';
import { useQuasar } from 'quasar';
import { Album, Photo } from 'src/components/models';
import DialogStateComposable from 'src/composables/dialog-state-composable';
import PhotoService from 'src/services/photo-service';
import { albumStore } from 'src/stores/album-store';
import { userStore } from 'src/stores/user-store';
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const photoService = new PhotoService();
const q = useQuasar();
const route = useRoute();
const router = useRouter();

const store = albumStore();
const userPermissionStore = userStore();
const { getUploadPhotoDialogState, setUploadPhotoDialogState, getPhotoDetailDialogState, setPhotoDetailDialogState } =
  DialogStateComposable();

const selectedImageIndex = ref(-1);
const photosInAlbum = ref([] as Photo[]);
const isLoadingPhotos = ref(false);

const isAdminUser = computed(() => userPermissionStore.isAdminUser);
const albumId = computed(() => route.params.albumId as string);
const albumItem = computed(() => store.getAlbumById(albumId.value) as Album);
const getPhotoList = async () => {
  isLoadingPhotos.value = true;
  photosInAlbum.value = [];
  if (albumItem.value?.id) {
    photosInAlbum.value = await photoService.getPhotosByAlbumId(albumItem.value.id);
  }
  isLoadingPhotos.value = false;
};

getPhotoList();

if (!albumItem.value) {
  q.notify({
    timeout: 4000,
    progress: true,
    color: 'negative',
    icon: 'mdi-alert-circle-outline',
    message: "Album doesn't exist. You will be redirected to the home page in 5 seconds",
  });
  setTimeout(() => router.push('/'), 5000);
}

const showLightBox = (imageIndex: number) => {
  setPhotoDetailDialogState(true);
  selectedImageIndex.value = imageIndex;
};

watch(albumId, (newValue) => {
  if (newValue) {
    getPhotoList();
  }
});
</script>
