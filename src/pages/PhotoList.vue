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
    <div v-if="isAdminUser" class="flex items-center justify-between q-pb-md">
      <div class="text-h6 flex items-center">
        <q-btn
          v-if="getSelectedPhotoList.length !== photoKeysList.length"
          icon="mdi-check-all"
          round
          @click="setSelectedPhotosList(photoKeysList)"
          flat
        >
          <q-tooltip> Select all photos </q-tooltip>
        </q-btn>
        <q-btn v-if="getSelectedPhotoList.length > 0" flat icon="mdi-close" round @click="setSelectedPhotosList([])">
          <q-tooltip> Unselect all photos </q-tooltip>
        </q-btn>
        <div v-if="getSelectedPhotoList.length > 0">{{ getSelectedPhotoList.length }} selected</div>
      </div>
      <div>
        <q-btn
          v-if="getSelectedPhotoList.length > 0"
          flat
          icon="mdi-delete"
          round
          @click="setDeletePhotoDialogState(true)"
        >
          <q-tooltip> Delete selected photos </q-tooltip>
        </q-btn>
        <q-btn
          v-if="getSelectedPhotoList.length > 0"
          flat
          icon="mdi-image-move"
          round
          @click="setMovePhotoDialogState(true)"
        >
          <q-tooltip> Move selected photos to another album </q-tooltip>
        </q-btn>
      </div>
    </div>
    <div class="q-col-gutter-md row">
      <div v-if="isAdminUser" class="col-xl-2 col-lg-2 col-md-3 col-sm-4 col-xs-6" data-test-id="add-photo-item">
        <div class="relative-position">
          <div class="no-album-cover-square rounded-borders-lg cursor-pointer" @click="setUploadPhotoDialogState(true)">
            <q-icon class="absolute-center" color="black" name="mdi-image-plus" size="48px">
              <q-tooltip> Upload photos </q-tooltip>
            </q-icon>
          </div>
        </div>
      </div>
      <template v-if="photosInAlbum.length > 0">
        <div
          v-for="(photo, index) in photosInAlbum"
          :key="photo.key"
          class="photo-item col-xl-2 col-lg-2 col-md-3 col-sm-4 col-xs-6"
          data-test-id="photo-item"
        >
          <div class="relative-position">
            <q-img
              :ratio="1"
              :src="`${photo.url}?tr=w-250,h-250`"
              class="rounded-borders-lg cursor-pointer"
              @click="goToPhotoDetail(index)"
            />
            <div class="absolute-top flex justify-between photo-top-button-container">
              <q-checkbox
                v-if="isAdminUser"
                v-model="selectedPhotosList"
                :val="photo.key"
                checked-icon="mdi-check-circle"
                color="positive"
                unchecked-icon="mdi-check-circle"
              >
                <q-tooltip> Select photo </q-tooltip>
              </q-checkbox>
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
        </div>
      </template>
    </div>
  </div>
  <MovePhotoDialog v-if="getMovePhotoDialogState" @refreshPhotoList="refreshPhotoList" />
  <ConfirmDeletePhotosDialog
    v-if="getDeletePhotoDialogState"
    :album-id="albumItem?.id"
    @refreshPhotoList="refreshPhotoList"
  />
  <UploadPhotosDialog v-if="getUploadPhotoDialogState" :album-id="albumItem?.id" @refreshPhotoList="refreshPhotoList" />
  <PhotoDetail v-if="photoId" @refreshPhotoList="refreshPhotoList" />
</template>

<script lang="ts" setup>
import { useQuasar } from 'quasar';
import ConfirmDeletePhotosDialog from 'components/dialog/ConfirmDeletePhotosDialog.vue';
import EditPhotoButton from 'components/button/EditPhotoButton.vue';
import MovePhotoDialog from 'components/dialog/MovePhotoDialog.vue';
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
const {
  selectedPhotosList,
  getSelectedPhotoList,
  setSelectedPhotosList,
  getUploadPhotoDialogState,
  setUploadPhotoDialogState,
  getDeletePhotoDialogState,
  setDeletePhotoDialogState,
  getMovePhotoDialogState,
  setMovePhotoDialogState,
} = DialogStateComposable();

const isAdminUser = computed(() => userPermissionStore.isAdminUser);
const albumId = computed(() => route.params.albumId as string);
const albumItem = computed(() => useAlbumStore.getAlbumById(albumId.value) as Album);
const photosInAlbum = computed(() => usePhotoStore.photoList as Photo[]);
const photoKeysList = computed(() => photosInAlbum.value.map((photo) => photo.key));
const photoId = computed(() => route.query.photo as string);

const isAlbumEmpty = ref(false);
const refreshPhotoList = async () => {
  setSelectedPhotosList([]);
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
    setSelectedPhotosList([]);
  }
});
</script>
<style lang="scss">
.photo-item {
  .photo-top-button-container {
    &:hover {
      cursor: pointer;
      background: rgba(0, 0, 0, 0.2);
      opacity: 1;
      transition: all 0.5s;
      -webkit-transition: all 0.5s;
      -moz-transition: all 0.5s;
      border-radius: 8px 8px 0 0;
    }
  }
  .q-checkbox,
  .q-checkbox__inner--falsy {
    color: white !important;
  }
}
</style>
