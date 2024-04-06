<template>
  <div class="q-pt-md">
    <div :key="photoId" class="row items-center">
      <q-btn color="primary" icon="mdi-arrow-left" round size="md" unelevated @click="goBack()" />
      <div class="text-h5 text-weight-medium q-py-md q-pl-md-sm" data-test-id="album-name">
        <q-btn-group outline>
          <q-btn
            :outline="photoStyle === 'grid'"
            color="primary"
            data-test-id="photo-list-style-button"
            dense
            icon="mdi-format-list-bulleted-square"
            padding="sm"
            @click="setPhotoListStyle('detail')"
          />
          <q-btn
            :outline="photoStyle === 'detail'"
            color="primary"
            data-test-id="photo-grid-style-button"
            dense
            icon="mdi-view-grid"
            padding="sm"
            @click="setPhotoListStyle('grid')"
          />
        </q-btn-group>
        <q-btn v-if="albumItem?.place" icon="mdi-map" round size="md" unelevated data-test-id="album-map-button">
          <q-tooltip :offset="[0, 0]" class="bg-transparent" max-width="300px" style="width: 300px">
            <q-card>
              <q-card-section class="text-h6 text-grey-7">
                {{ albumItem.place.displayName }}
              </q-card-section>
              <q-card-section>
                <PhotoLocationMap
                  :latitude="albumItem.place.location.latitude"
                  :longitude="albumItem.place.location.longitude"
                />
              </q-card-section>
            </q-card>
          </q-tooltip>
        </q-btn>
        {{ albumItem?.albumName }} {{ albumItem?.isPrivate ? '(private album)' : '' }}
      </div>
    </div>
    <div class="text-h6 text-grey-7 q-pb-md" data-test-id="album-desc">{{ albumItem?.description }}</div>
    <div v-if="albumItem?.tags?.length && albumItem?.tags?.length > 0" class="flex q-pb-md">
      <q-chip v-for="(tag, i) in albumItem.tags" :key="i" color="secondary" data-test-id="album-tag">
        {{ tag }}
      </q-chip>
    </div>
    <q-card
      v-if="isAdminUser"
      bordered
      class="admin-panel q-mb-md flex items-center justify-between"
      flat
      data-test-id="photo-manage-panel"
    >
      <div class="text-h6 flex items-center">
        <q-btn flat icon="mdi-image-plus" round @click="setUploadPhotoDialogState(true)">
          <q-tooltip> Upload photos</q-tooltip>
        </q-btn>
        <q-separator inset vertical />
        <q-btn
          v-if="getSelectedPhotoList.length !== photoAmount && getSelectedPhotoList.length < 50"
          flat
          icon="mdi-check-all"
          round
          data-test-id="select-all-photos-button"
          @click="setSelectedPhotosList(photoKeysList)"
        >
          <q-tooltip> Select all photos (Max 50 photos)</q-tooltip>
        </q-btn>
        <q-btn
          v-if="getSelectedPhotoList.length > 0"
          flat
          icon="mdi-close"
          round
          data-test-id="unselect-all-photos-button"
          @click="setSelectedPhotosList([])"
        >
          <q-tooltip> Unselect all photos</q-tooltip>
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
          <q-tooltip> Delete selected photos</q-tooltip>
        </q-btn>
        <q-btn
          v-if="getSelectedPhotoList.length > 0"
          flat
          icon="mdi-image-move"
          round
          @click="setMovePhotoDialogState(true)"
        >
          <q-tooltip> Move selected photos to another album</q-tooltip>
        </q-btn>
      </div>
    </q-card>
    <template v-if="photosInAlbum.length > 0">
      <div v-if="photoStyle === 'grid'" class="q-col-gutter-md row">
        <Photo v-for="photo in photosInAlbum" :key="photo.key" :photo="photo" :photo-style="photoStyle" />
      </div>
      <div v-else class="row">
        <Photo v-for="photo in photosInAlbum" :key="photo.key" :photo="photo" :photo-style="photoStyle" />
      </div>
    </template>
    <template v-if="photosInAlbum.length === 0 && !fetchingPhotos">
      <div class="text-h5 text-weight-medium">No results.</div>
    </template>
  </div>
  <MovePhotoDialog
    v-if="getMovePhotoDialogState"
    :album-id="albumItem?.id"
    @close-photo-detail-dialog="closePhotoDetailDialog"
    @refresh-photo-list="refreshPhotoList"
  />
  <ConfirmDeletePhotosDialog
    v-if="getDeletePhotoDialogState"
    :album-id="albumItem?.id"
    @close-photo-detail-dialog="closePhotoDetailDialog"
    @refresh-photo-list="refreshPhotoList"
  />
  <UploadPhotosDialog
    v-if="getUploadPhotoDialogState"
    :album-id="albumItem?.id"
    @refresh-photo-list="refreshPhotoList"
  />
  <PhotoDetailDialog v-if="photoId" @refresh-photo-list="refreshPhotoList" />
  <RenamePhotoDialog
    v-if="getRenamePhotoDialogState"
    :album-id="albumItem?.id"
    @close-photo-detail-dialog="closePhotoDetailDialog"
    @refresh-photo-list="refreshPhotoList"
  />
</template>

<script lang="ts" setup>
import ConfirmDeletePhotosDialog from 'components/dialog/ConfirmDeletePhotosDialog.vue';
import MovePhotoDialog from 'components/dialog/MovePhotosDialog.vue';
import PhotoDetailDialog from 'components/dialog/PhotoDetailDialog.vue';
import RenamePhotoDialog from 'components/dialog/RenamePhotoDialog.vue';
import UploadPhotosDialog from 'components/dialog/UploadPhotosDialog.vue';
import { Album, Photo as IPhoto } from 'components/models';
import Photo from 'components/Photo.vue';
import PhotoLocationMap from 'components/PhotoLocationMap.vue';
import DialogStateComposable from 'src/composables/dialog-state-composable';
import SelectedItemsComposable from 'src/composables/selected-items-composaable';
import { albumStore } from 'stores/album-store';
import { photoStore } from 'stores/photo-store';
import { userStore } from 'stores/user-store';
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const useAlbumStore = albumStore();
const userPermissionStore = userStore();
const usePhotoStore = photoStore();
const {
  getUploadPhotoDialogState,
  setUploadPhotoDialogState,
  getDeletePhotoDialogState,
  setDeletePhotoDialogState,
  getMovePhotoDialogState,
  setMovePhotoDialogState,
  getRenamePhotoDialogState,
} = DialogStateComposable();
const { getSelectedPhotoList, setSelectedPhotosList } = SelectedItemsComposable();

const isAdminUser = computed(() => userPermissionStore.isAdminUser);
const photoStyle = ref((route.query.photoStyle as string) || 'grid'); // Grid is default photo list style
const albumId = computed(() => route.params.albumId as string);
const albumItem = computed(() => useAlbumStore.getAlbumById(albumId.value) as Album);
const photosInAlbum = computed(() => usePhotoStore.photoList as IPhoto[]);
const fetchingPhotos = computed(() => usePhotoStore.fetchingPhotos);
const photoKeysList = computed(() => photosInAlbum.value.map((photo) => photo.key).slice(0, 50)); // Max 50 photos
const photoAmount = computed(() => photosInAlbum.value.length);
const photoId = computed(() => route.query.photo as string);

const goBack = () => {
  router.back();
};

const setPhotoListStyle = (type: 'detail' | 'grid') => {
  photoStyle.value = type;
  router.replace({ query: { photoStyle: type } });
};

const closePhotoDetailDialog = () => {
  router.replace({ query: { photo: undefined } });
};

const refreshPhotoList = async () => {
  const isPrevAlbumEmpty = photosInAlbum.value.length === 0;
  await usePhotoStore.getPhotos(albumId.value, true);
  const isCurrentAlbumEmpty = photosInAlbum.value.length === 0;
  if (isPrevAlbumEmpty) {
    // If album is empty before uploading photos, set the first photo as album cover.
    const albumToBeSubmitted = { ...(albumItem.value as Album), albumCover: photosInAlbum.value[0].key as string };
    useAlbumStore.updateAlbumCover(albumToBeSubmitted);
  } else if (!isPrevAlbumEmpty && isCurrentAlbumEmpty) {
    const albumToBeSubmitted = { ...(albumItem.value as Album), albumCover: '' };
    useAlbumStore.updateAlbumCover(albumToBeSubmitted);
  }

  setSelectedPhotosList([]);
};

usePhotoStore.getPhotos(albumId.value);

watch(albumId, (newValue) => {
  if (newValue) {
    usePhotoStore.getPhotos(newValue);
    setSelectedPhotosList([]);
  }
});
</script>
