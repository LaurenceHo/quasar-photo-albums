<template>
  <template v-if="isFetchingPhotos">
    <SkeletonPhotoList />
  </template>
  <template v-else>
    <div v-if="!photoId && !showPhotoUploader" class="py-4">
      <div class="flex flex-col sm:flex-row items-start sm:items-center pb-4">
        <div class="flex items-center w-full sm:w-auto">
          <Button class="flex-shrink-0" rounded @click="goBack">
            <template #icon>
              <IconArrowNarrowLeft :size="24" />
            </template>
          </Button>
          <SelectButton
            v-model="photoStyle"
            :options="['grid', 'detail']"
            aria-labelledby="basic"
            class="ml-2 flex-shrink-0"
            @update:model-value="(value) => router.replace({ query: { ...route.query, photoStyle: value } })"
          >
            <template #option="{ option }">
              <template v-if="option === 'grid'">
                <IconLayoutGrid :size="24" />
              </template>
              <template v-else>
                <IconList :size="24" />
              </template>
            </template>
          </SelectButton>
          <Button
            v-if="currentAlbum?.place"
            class="ml-2 flex-shrink-0"
            data-test-id="album-map-button"
            outlined
            severity="secondary"
            @click="toggle"
          >
            <template #icon>
              <IconMap2 :size="24" />
            </template>
          </Button>
          <Popover ref="showMap">
            <div class="flex flex-col gap-4">
              <h3 class="text-lg text-gray-600">{{ currentAlbum.place?.displayName }}</h3>
              <PhotoLocationMap
                :latitude="currentAlbum.place?.location.latitude"
                :longitude="currentAlbum.place?.location.longitude"
                style="width: 250px"
              />
            </div>
          </Popover>
          <IconLock
            v-if="currentAlbum?.isPrivate"
            v-tooltip="'This is a private album'"
            :size="24"
            class="text-gray-600 ml-2"
          />
          <IconStar
            v-else-if="currentAlbum?.isFeatured"
            v-tooltip="'This is a featured album'"
            :size="24"
            class="text-gray-600 ml-2"
          />
        </div>
        <p
          v-if="currentAlbum?.description"
          class="text-xl text-gray-600 py-2 mt-2 sm:mt-0 sm:ml-2 w-full sm:w-auto sm:flex-grow sm:min-w-0"
          data-test-id="album-desc"
        >
          {{ currentAlbum?.description }}
        </p>
      </div>
      <div v-if="currentAlbum?.tags?.length && currentAlbum?.tags?.length > 0" class="flex flex-wrap gap-2 pb-4">
        <Tag v-for="(tag, i) in currentAlbum.tags" :key="i" :value="tag" data-test-id="album-tag" severity="success" />
      </div>
      <Toolbar v-if="isAdmin" class="mb-4 !p-2" data-test-id="photo-manage-panel">
        <template #start>
          <Button
            v-tooltip="'Upload photos'"
            data-test-id="upload-photos-button"
            severity="secondary"
            text
            @click="showPhotoUploader = true"
          >
            <template #icon>
              <IconPhotoUp :size="24" />
            </template>
          </Button>
        </template>
        <template #center>
          <Button
            v-if="selectedPhotos.length !== photoAmount && selectedPhotos.length < 50"
            v-tooltip="'Select all photos (maximum 50 photos)'"
            data-test-id="select-all-photos-button"
            severity="secondary"
            text
            @click="setSelectedPhotos(photoKeysList)"
          >
            <template #icon>
              <IconChecks :size="24" />
            </template>
          </Button>
          <Button
            v-if="selectedPhotos.length > 0"
            v-tooltip="'Unselect all photos'"
            data-test-id="unselect-all-photos-button"
            severity="secondary"
            text
            @click="setSelectedPhotos([])"
          >
            <template #icon>
              <IconX :size="24" />
            </template>
          </Button>
          <span v-if="selectedPhotos.length > 0" class="ml-2"> {{ selectedPhotos.length }} selected </span>
        </template>
        <template #end>
          <Button
            v-if="selectedPhotos.length > 0"
            v-tooltip.left="'Delete selected photos'"
            severity="secondary"
            text
            @click="setDeletePhotoDialogState(true)"
          >
            <template #icon>
              <IconTrash :size="24" />
            </template>
          </Button>
          <Button
            v-if="selectedPhotos.length > 0"
            v-tooltip.left="'Move selected photos'"
            severity="secondary"
            text
            @click="setMovePhotoDialogState(true)"
          >
            <template #icon>
              <IconFileExport :size="24" />
            </template>
          </Button>
        </template>
      </Toolbar>
      <div
        v-if="photosInAlbum.length > 0"
        :class="[
          'grid',
          photoStyle === 'grid'
            ? 'gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'
            : 'gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
        ]"
      >
        <Photo v-for="photo in photosInAlbum" :key="photo.key" :photo="photo" :photo-style="photoStyle" />
      </div>
      <h2 v-if="photosInAlbum.length === 0">No results.</h2>
      <ScrollTop />
    </div>
    <div v-else class="py-4">
      <transition
        appear
        enter-active-class="transition ease-out duration-300"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition ease-in duration-300"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <PhotoDetail v-if="photoId" @refresh-photo-list="refreshPhotoList" @close-photo-detail="closePhotoDetail" />
        <UploadPhotos
          v-else-if="showPhotoUploader && isAdmin"
          :album-id="currentAlbum?.id"
          @refresh-photo-list="refreshPhotoList"
          @close-photo-uploader="showPhotoUploader = false"
        />
      </transition>
    </div>
  </template>

  <MovePhotos
    v-if="movePhotoDialogState"
    :album-id="currentAlbum?.id"
    @close-photo-detail="closePhotoDetail"
    @refresh-photo-list="refreshPhotoList"
  />
  <DeletePhotos
    v-if="deletePhotoDialogState"
    :album-id="currentAlbum?.id"
    @close-photo-detail="closePhotoDetail"
    @refresh-photo-list="refreshPhotoList"
  />
  <RenamePhoto
    v-if="renamePhotoDialogState"
    :album-id="currentAlbum?.id"
    @close-photo-detail="closePhotoDetail"
    @refresh-photo-list="refreshPhotoList"
  />

  <Toast position="bottom-center" />
</template>

<script lang="ts" setup>
import { DeletePhotos, MovePhotos, RenamePhoto } from '@/components/dialog';
import Photo from '@/components/Photo.vue';
import PhotoDetail from '@/components/PhotoDetail.vue';
import PhotoLocationMap from '@/components/PhotoLocationMap.vue';
import SkeletonPhotoList from '@/components/SkeletonPhotoList.vue';
import UploadPhotos from '@/components/UploadPhotos.vue';
import useAlbums from '@/composables/use-albums';
import useDialog from '@/composables/use-dialog';
import usePhotos from '@/composables/use-photos';
import useUserConfig from '@/composables/use-user-config';
import type { Album } from '@/schema';
import { AlbumService } from '@/services/album-service';
import {
  IconArrowNarrowLeft,
  IconChecks,
  IconFileExport,
  IconLayoutGrid,
  IconList,
  IconLock,
  IconMap2,
  IconPhotoUp,
  IconStar,
  IconTrash,
  IconX
} from '@tabler/icons-vue';
import Button from 'primevue/button';
import Popover from 'primevue/popover';
import ScrollTop from 'primevue/scrolltop';
import SelectButton from 'primevue/selectbutton';
import Tag from 'primevue/tag';
import Toast from 'primevue/toast';
import Toolbar from 'primevue/toolbar';
import { useToast } from 'primevue/usetoast';
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const toast = useToast();
const route = useRoute();
const router = useRouter();

const {
  deletePhotoDialogState,
  setDeletePhotoDialogState,
  movePhotoDialogState,
  setMovePhotoDialogState,
  renamePhotoDialogState
} = useDialog();
const { isAdmin } = useUserConfig();
const { isFetchingPhotos, photosInAlbum, selectedPhotos, setSelectedPhotos, fetchPhotos } = usePhotos();
const { currentAlbum, fetchAlbumsByYear } = useAlbums();

const albumId = computed(() => route.params['albumId'] as string);
const albumYear = computed(() => route.params['year'] as string);
const photoKeysList = computed(() => photosInAlbum.value.map((photo) => photo.key).slice(0, 50)); // Max 50 photos
const photoAmount = computed(() => photosInAlbum.value.length);
const photoId = computed(() => route.query['photo'] as string);

const showPhotoUploader = ref(false);
const showMap = ref();
const photoStyle = ref((route.query['photoStyle'] as string) || 'grid'); // Grid is default photo list style

const toggle = (event: any) => {
  showMap.value.toggle(event);
};

const goBack = () => {
  if (window.history.state.back === null) {
    router.push({ name: 'albumsByYear', params: { year: albumYear.value } });
  } else {
    router.back();
  }
};

const closePhotoDetail = async () => await router.replace({ query: { ...route.query, photo: undefined } });

const refreshPhotoList = async () => {
  const isPrevAlbumEmpty = photosInAlbum.value.length === 0;
  await fetchPhotos(albumId.value, albumYear.value, true);
  const isCurrentAlbumEmpty = photosInAlbum.value.length === 0;

  let albumToBeUpdated = null;
  if (isPrevAlbumEmpty) {
    // If album is empty before uploading photos, set the first photo as album cover.
    albumToBeUpdated = { ...(currentAlbum.value as Album), albumCover: photosInAlbum.value[0]?.key as string };
  } else if (!isPrevAlbumEmpty && isCurrentAlbumEmpty) {
    albumToBeUpdated = { ...(currentAlbum.value as Album), albumCover: '' };
  }
  if (albumToBeUpdated) {
    const result = await AlbumService.updateAlbum(albumToBeUpdated);
    if (result.code === 200) {
      await fetchAlbumsByYear(albumToBeUpdated.year, true);
    }
  }

  setSelectedPhotos([]);
};

fetchAlbumsByYear(albumYear.value);
fetchPhotos(albumId.value, albumYear.value).catch(() => {
  toast.add({
    severity: 'error',
    summary: 'Error',
    detail: 'Error while fetching photos. Please try again later.',
    life: 3000
  });
});

watch(albumId, (newValue) => {
  if (newValue) {
    fetchPhotos(newValue, albumYear.value);
    setSelectedPhotos([]);
  }
});
</script>
