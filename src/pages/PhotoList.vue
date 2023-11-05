<template>
  <div class="q-pt-md">
    <div :key="photoId" class="row items-center">
      <q-btn color="primary" icon="mdi-arrow-left" round size="md" to="/" unelevated />
      <div class="text-h4 q-py-md q-pl-sm" data-test-id="album-name">
        {{ albumItem?.albumName }} {{ albumItem?.isPrivate ? '(private album)' : '' }}
      </div>
    </div>
    <div class="text-h6 text-grey q-pb-md" data-test-id="album-desc">{{ albumItem?.description }}</div>
    <div v-if="albumItem?.tags?.length > 0" class="flex q-pb-md">
      <q-chip v-for="(tag, i) in albumItem.tags" :key="i" color="secondary" data-test-id="album-tag">
        {{ tag }}
      </q-chip>
    </div>
    <div v-if="selectedPhotos.length > 0" class="flex items-center justify-between q-pb-md">
      <div class="text-h6 flex items-center">
        <q-btn flat icon="mdi-close" round @click="selectedPhotos = []" />
        <div>{{ selectedPhotos.length }} selected</div>
      </div>
      <q-btn flat icon="mdi-file-image-remove" round @click="setDeletePhotoDialogState(true)" />
    </div>
    <div class="q-col-gutter-md row">
      <div v-if="isAdminUser" class="col-xl-2 col-lg-2 col-md-3 col-sm-4 col-xs-6" data-test-id="add-photo-item">
        <div class="relative-position">
          <div class="no-album-cover-square rounded-borders-lg cursor-pointer" @click="setUploadPhotoDialogState(true)">
            <q-icon class="absolute-center" color="black" name="mdi-image-plus" size="48px" />
          </div>
        </div>
      </div>
      <template v-if="photosInAlbum.length > 0">
        <div
          v-for="(photo, index) in photosInAlbum"
          :key="photo.key"
          class="photo-items col-xl-2 col-lg-2 col-md-3 col-sm-4 col-xs-6"
          data-test-id="photo-item"
        >
          <div class="relative-position">
            <q-img
              :ratio="1"
              :src="`${photo.url}?tr=w-250,h-250`"
              class="rounded-borders-lg cursor-pointer"
              @click="goToPhotoDetail(index)"
            />
            <q-checkbox
              v-if="isAdminUser"
              v-model="selectedPhotos"
              :val="photo.key"
              checked-icon="mdi-check-circle"
              class="absolute-top-left"
              color="white"
              size="lg"
              unchecked-icon="mdi-check-circle-outline"
            />
            <EditPhotoButton
              v-if="isAdminUser"
              :album-item="albumItem"
              :is-album-cover="photo.key === albumItem?.albumCover"
              :photo-key="photo.key"
              color="white"
              @refreshPhotoList="refreshPhotoList"
            />
          </div>
        </div>
      </template>
    </div>
  </div>
  <ConfirmDeletePhotosDialog
    v-if="getDeletePhotoDialogState"
    :album-id="albumItem?.id"
    :selected-photos="selectedPhotos"
    @refreshPhotoList="refreshPhotoList"
  />
  <UploadPhotosDialog v-if="getUploadPhotoDialogState" :album-id="albumItem?.id" @refreshPhotoList="refreshPhotoList" />
  <PhotoDetail v-if="photoId" @refreshPhotoList="refreshPhotoList" />
</template>

<script lang="ts" setup>
import { useQuasar } from 'quasar';
import EditPhotoButton from 'components/button/EditPhotoButton.vue';
import ConfirmDeletePhotosDialog from 'components/dialog/ConfirmDeletePhotosDialog.vue';
import PhotoDetail from 'components/dialog/PhotoDetail.vue';
import UploadPhotosDialog from 'components/dialog/UploadPhotosDialog.vue';
import { Album, Photo } from 'components/models';
import DialogStateComposable from 'src/composables/dialog-state-composable';
import AlbumService from 'src/services/album-service';
import { albumStore } from 'stores/album-store';
import { userStore } from 'stores/user-store';
import { photoStore } from 'stores/photo-store';
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const q = useQuasar();
const route = useRoute();
const router = useRouter();

const albumService = new AlbumService();
const useAlbumStore = albumStore();
const userPermissionStore = userStore();
const usePhotoStore = photoStore();
const { getUploadPhotoDialogState, setUploadPhotoDialogState, getDeletePhotoDialogState, setDeletePhotoDialogState } =
  DialogStateComposable();

const isAdminUser = computed(() => userPermissionStore.isAdminUser);
const albumId = computed(() => route.params.albumId as string);
const albumItem = computed(() => useAlbumStore.getAlbumById(albumId.value) as Album);
const photosInAlbum = computed(() => usePhotoStore.photoList as Photo[]);
const photoId = computed(() => route.query.photo as string);

const isAlbumEmpty = ref(false);
const selectedPhotos = ref([] as string[]);
const refreshPhotoList = async () => {
  selectedPhotos.value = [];
  isAlbumEmpty.value = photosInAlbum.value.length === 0;

  await usePhotoStore.getPhotos(albumId.value, true);
  // If album is empty before uploading photos, set the first photo as album cover.
  if (isAlbumEmpty.value) {
    const albumToBeSubmitted = { ...(albumItem.value as Album), albumCover: photosInAlbum.value[0].key as string };
    await albumService.updateAlbum(albumToBeSubmitted);
    useAlbumStore.updateAlbumCover(albumToBeSubmitted);
  }
};

usePhotoStore.getPhotos(albumId.value);

const goToPhotoDetail = (imageIndex: number) => {
  usePhotoStore.$patch({ selectedImageIndex: imageIndex });
  const photoKeyForUrl = photosInAlbum.value[imageIndex].key.split('/')[1];
  router.replace({ query: { photo: photoKeyForUrl } });
};

watch(albumId, (newValue) => {
  if (newValue) {
    usePhotoStore.getPhotos(newValue);
  }
});
</script>
<style lang="scss">
.photo-items {
  .q-checkbox,
  .q-checkbox__inner {
    color: white !important;
  }
}
</style>
