<template>
  <template v-if="photoId">
    <PhotoDetail />
  </template>
  <div v-else class="q-pt-md">
    <div class="row items-center">
      <q-btn color="primary" icon="mdi-arrow-left" round size="md" unelevated to="/" />
      <div class="text-h4 q-py-md q-pl-sm" data-test-id="album-name">
        {{ albumItem?.albumName }} {{ albumItem?.isPrivate ? '(private album)' : '' }}
      </div>
    </div>
    <div class="text-h6 text-grey q-pb-md" data-test-id="album-desc">{{ albumItem?.description }}</div>
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
              @click="goToPhotoDetail(index)"
            />
            <EditPhotoButton
              v-if="isAdminUser"
              :photo-key="photo.key"
              :album-item="albumItem"
              :is-album-cover="photo.key === albumItem?.albumCover"
              @refreshPhotoList="refreshPhotoList"
              color="white"
            />
          </div>
        </div>
      </template>
    </div>
  </div>
  <UploadPhotosDialog v-if="getUploadPhotoDialogState" :album-id="albumItem?.id" @refreshPhotoList="refreshPhotoList" />
</template>

<script lang="ts" setup>
import EditPhotoButton from 'components/button/EditPhotoButton.vue';
import UploadPhotosDialog from 'components/dialog/UploadPhotosDialog.vue';
import PhotoDetail from 'pages/PhotoDetail.vue';
import { useQuasar } from 'quasar';
import { Album, Photo } from 'src/components/models';
import DialogStateComposable from 'src/composables/dialog-state-composable';
import { albumStore } from 'src/stores/album-store';
import { userStore } from 'src/stores/user-store';
import { photoStore } from 'stores/photo-store';
import { computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const q = useQuasar();
const route = useRoute();
const router = useRouter();

const useAlbumStore = albumStore();
const userPermissionStore = userStore();
const usePhotoStore = photoStore();
const { getUploadPhotoDialogState, setUploadPhotoDialogState } = DialogStateComposable();

const isAdminUser = computed(() => userPermissionStore.isAdminUser);
const albumId = computed(() => route.params.albumId as string);
const albumItem = computed(() => useAlbumStore.getAlbumById(albumId.value) as Album);
const photosInAlbum = computed(() => usePhotoStore.photoList as Photo[]);
const photoId = computed(() => route.query.photo as string);

const refreshPhotoList = async () => usePhotoStore.getPhotos(albumId.value, true);

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
