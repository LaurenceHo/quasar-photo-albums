<template>
  <Dialog
    v-model:visible="movePhotoDialogState"
    :breakpoints="{ '960px': '75vw', '641px': '90vw' }"
    :style="{ width: '400px' }"
  >
    <template #header>
      <div v-if="duplicatedPhotoKeys.length === 0" class="text-xl font-bold">
        Move photo{{ selectedPhotos.length > 1 ? 's' : '' }} to another album
      </div>
      <div v-else class="flex">
        <IconFileAlert :size="40" class="text-yellow-600 mr-2" />
        <span class="text-xl font-semibold">
          Photo{{ duplicatedPhotoKeys.length > 1 ? 's' : '' }} exist{{ duplicatedPhotoKeys.length < 2 ? 's' : '' }} in
          {{ selectedAlbum }}
        </span>
      </div>
    </template>

    <div v-if="duplicatedPhotoKeys.length === 0" class="flex flex-col mb-4">
      Select another album for {{ selectedPhotos.length > 1 ? 'these' : 'this' }} photo{{
        selectedPhotos.length > 1 ? 's' : ''
      }}.
      <select-year :selected-year="selectedYear" class="my-4" @select-year="setSelectedYear" />
      <Select
        v-model="selectedAlbum"
        :disabled="isFetchingAlbums"
        :loading="isFetchingAlbums"
        :options="filteredAlbumsList"
        class="w-full"
        filter
        option-label="label"
        option-value="value"
        placeholder="Select an album"
        show-clear
        @filter="filterAlbumsFunction"
      />
    </div>

    <div class="max-h-[50vh] overflow-y-auto">
      <template v-if="duplicatedPhotoKeys.length === 0">
        <div v-for="photoKey in photoKeysArray" :key="photoKey" class="mb-2">
          {{ photoKey }}
        </div>
      </template>

      <template v-else>
        <div v-for="photoKey in duplicatedPhotoKeys" :key="photoKey" class="mb-2">{{ photoKey }}</div>
      </template>
    </div>

    <template #footer>
      <Button
        :disabled="isProcessing"
        :label="duplicatedPhotoKeys.length === 0 ? 'Cancel' : 'Close'"
        text
        @click="closeMovePhotoDialog"
      />
      <Button
        v-if="duplicatedPhotoKeys.length === 0"
        :disabled="!selectedAlbum || isProcessing || photoKeysArray.length === 0"
        :loading="isProcessing"
        data-test-id="move-photos-button"
        label="Move"
        @click="confirmMovePhotos"
      />
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import SelectYear from '@/components/select/SelectYear.vue';
import DialogContext from '@/composables/dialog-context';
import PhotosContext from '@/composables/photos-context';
import type { Photo } from '@/schema';
import { AlbumService } from '@/services/album-service';
import { PhotoService } from '@/services/photo-service';
import { IconFileAlert } from '@tabler/icons-vue';
import { useQuery } from '@tanstack/vue-query';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Select from 'primevue/select';
import { computed, ref, toRefs, watch } from 'vue';
import { useRoute } from 'vue-router';

const emits = defineEmits(['refreshPhotoList', 'closePhotoDetail']);
const props = defineProps({
  albumId: {
    type: String,
    required: true
  }
});
const { albumId } = toRefs(props);

const { movePhotoDialogState, setMovePhotoDialogState } = DialogContext();
const { selectedPhotos } = PhotosContext();
const route = useRoute();

const selectedYear = ref<string>((route.params['year'] as string) || 'na');

const { data: albumsData, isLoading: isFetchingAlbums } = useQuery({
  queryKey: ['getAlbumsByYear', selectedYear],
  queryFn: () => AlbumService.getAlbumsByYear(selectedYear.value),
  enabled: computed(() => !!selectedYear.value)
});

const mappedAlbumList = computed(() => {
  if (!albumsData.value?.data || albumsData.value?.data?.length === 0) return [];

  return albumsData.value.data
    .filter((album) => album.id !== albumId.value)
    .map((album) => ({ label: album.albumName, value: album.id }));
});

const photoKeysArray = computed(
  () =>
    selectedPhotos.value.map((photoKey: string) => {
      const photoKeyArray = photoKey?.split('/');
      return photoKeyArray.length > 1 ? photoKeyArray[1] : photoKeyArray[0];
    }) as string[]
);

const duplicatedPhotoKeys = ref<string[]>([]);
const filteredAlbumsList = ref<{ label: string; value: string }[]>(mappedAlbumList.value ?? []);
const selectedAlbum = ref<string>(filteredAlbumsList.value[0]?.value ?? '');
const isProcessing = ref(false);
const needToRefreshPhotoList = ref(false);

const setSelectedYear = (year: string) => {
  selectedYear.value = year;
};

const filterAlbumsFunction = (event: { filter: string }) => {
  filteredAlbumsList.value = mappedAlbumList.value.filter(
    (album) => album.label.toLowerCase().indexOf(event.filter.toLowerCase()) > -1 && album.value !== albumId.value
  );
};

const confirmMovePhotos = async () => {
  isProcessing.value = true;
  const photosInSelectedAlbum = await PhotoService.getPhotosByAlbumId(selectedAlbum.value, selectedYear.value);
  let tempDuplicatedPhotoKeys: string[] = [];
  if (photosInSelectedAlbum.data?.photos) {
    tempDuplicatedPhotoKeys = photosInSelectedAlbum.data.photos
      .filter((photo: Photo) => {
        const photoKey = photo.key.split('/')[1];
        if (photoKey) {
          return photoKeysArray.value.includes(photoKey);
        }
        return false;
      })
      .map((photo: Photo) => photo.key.split('/')[1] || '');
  }

  let filteredPhotoKeys = photoKeysArray.value;
  if (tempDuplicatedPhotoKeys.length > 0) {
    filteredPhotoKeys = photoKeysArray.value.filter((photoKey) => !tempDuplicatedPhotoKeys.includes(photoKey));
  }
  if (filteredPhotoKeys.length === 0) {
    duplicatedPhotoKeys.value = tempDuplicatedPhotoKeys;
    isProcessing.value = false;
    return;
  }

  const result = await PhotoService.movePhotos(albumId?.value, selectedAlbum.value, filteredPhotoKeys);
  isProcessing.value = false;
  duplicatedPhotoKeys.value = tempDuplicatedPhotoKeys;

  if (result.code === 200) {
    if (duplicatedPhotoKeys.value.length === 0) {
      setMovePhotoDialogState(false);
      emits('closePhotoDetail');
      emits('refreshPhotoList');
    } else {
      needToRefreshPhotoList.value = true;
    }
  }
};

const closeMovePhotoDialog = () => {
  if (needToRefreshPhotoList.value) {
    emits('refreshPhotoList');
  }
  setMovePhotoDialogState(false);
};

// Watch for changes in mappedAlbumList and update selectedAlbum
watch(mappedAlbumList, (newList) => {
  if (newList.length > 0) {
    filteredAlbumsList.value = newList;
    selectedAlbum.value = newList[0].value ?? '';
  }
});
</script>
