<template>
  <q-page class="q-pt-md">
    <div class="row items-center">
      <q-btn color="primary" icon="mdi-arrow-left" round size="md" unelevated to="/" />
      <div class="text-h4 q-py-md q-pl-sm" data-test-id="album-name">
        {{ albumItem?.albumName }} {{ albumItem?.private ? '(private album)' : '' }}
      </div>
    </div>
    <div class="text-h6 text-grey q-pb-md" data-test-id="album-desc">{{ albumItem?.desc }}</div>
    <div v-if="albumItem?.tags?.length > 0" class="flex q-pb-md">
      <q-chip v-for="(tag, i) in albumItem.tags" :key="i" data-test-id="album-tag">
        {{ tag }}
      </q-chip>
    </div>
    <div class="q-col-gutter-md row items-start">
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
  </q-page>
  <PhotoDetailDialog
    v-if="getPhotoDetailDialogState"
    :photos-in-album="photosInAlbum"
    :selected-image-index="selectedImageIndex"
  />
</template>

<script lang="ts" setup>
import PhotoDetailDialog from 'components/PhotoDetailDialog.vue';
import { copyToClipboard, Notify, useQuasar } from 'quasar';
import { getS3Url } from 'src/components/helper';
import { Album, Photo } from 'src/components/models';
import DialogStateComposable from 'src/composables/dialog-state-composable';
import S3Service from 'src/services/s3-service';
import { albumStore } from 'src/stores/album-store';
import { UserPermission, userStore } from 'src/stores/user-store';
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const q = useQuasar();
const s3Service = new S3Service();
const route = useRoute();

const store = albumStore();
const userPermissionStore = userStore();
const { getPhotoDetailDialogState, setPhotoDetailDialogState } = DialogStateComposable();

const selectedImageIndex = ref(-1);
const photosInAlbum = ref([] as Photo[]);

const userPermission = computed(() => userPermissionStore.userPermission as UserPermission);
const albumId = computed(() => route.params.albumId as string);
const albumItem = computed(() => store.getAlbumById(albumId.value) as Album);
const getPhotoList = async () => {
  photosInAlbum.value = [];
  if (albumItem.value?.id) {
    photosInAlbum.value = await s3Service.getPhotoObject(albumItem.value.id, 1000);
  }
};

getPhotoList();

const showLightBox = (imageIndex: number) => {
  setPhotoDetailDialogState(true);
  selectedImageIndex.value = imageIndex;
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

watch(albumId, (newValue) => {
  if (newValue) {
    getPhotoList();
  }
});
</script>
