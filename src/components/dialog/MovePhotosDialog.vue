<template>
  <q-dialog v-model="movePhotoDialogState">
    <q-card :style="$q.screen.gt.xs ? 'min-width: 400px' : 'min-width: 360px'">
      <q-card-section>
        <div v-if="duplicatedPhotoKeys.length === 0" class="text-h6">
          Move photo{{ getSelectedPhotoList.length > 1 ? 's' : '' }} to another album
        </div>
        <div v-else class="text-h6">
          <q-icon name="mdi-file-alert" color="warning" />
          Photo{{ duplicatedPhotoKeys.length > 1 ? 's' : '' }} exist{{ duplicatedPhotoKeys.length < 2 ? 's' : '' }} in
          {{ selectedAlbumModel.label }}
        </div>
      </q-card-section>

      <q-card-section v-if="duplicatedPhotoKeys.length === 0" class="q-pt-none">
        Select another album for {{ getSelectedPhotoList.length > 1 ? 'these' : 'this' }} photo{{
          getSelectedPhotoList.length > 1 ? 's' : ''
        }}.
        <select-year :selected-year="selectedYear" extra-class="q-pb-md" @select-year="setSelectedYear" />
        <q-select
          v-model="selectedAlbumModel"
          :options="filteredAlbumsList"
          clearable
          dense
          input-debounce="0"
          outlined
          use-input
          label="Album"
          :disable="isLoadingAlbums"
          :loading="isLoadingAlbums"
          @filter="filterAlbumsFunction"
        />
      </q-card-section>

      <q-card-section class="q-pt-none scroll" style="max-height: 50vh">
        <template v-if="duplicatedPhotoKeys.length === 0">
          <div v-for="photoKey in photoKeysArray" :key="photoKey" class="row">
            {{ photoKey }}
          </div>
        </template>

        <template v-else>
          <div v-for="photoKey in duplicatedPhotoKeys" :key="photoKey" class="row">{{ photoKey }}</div>
        </template>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          :disable="isProcessing"
          color="primary"
          flat
          :label="duplicatedPhotoKeys.length === 0 ? 'Cancel' : 'Close'"
          no-caps
          @click="closeMovePhotoDialog"
        />
        <q-btn
          v-if="duplicatedPhotoKeys.length === 0"
          data-test-id="move-photos-button"
          :disable="!selectedAlbumModel || isProcessing || photoKeysArray.length === 0"
          :loading="isProcessing"
          color="primary"
          label="Move"
          no-caps
          unelevated
          @click="confirmMovePhotos"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script lang="ts" setup>
import SelectYear from 'components/SelectYear.vue';
import DialogStateComposable from 'src/composables/dialog-state-composable';
import SelectedItemsComposable from 'src/composables/selected-items-composaable';
import AlbumService from 'src/services/album-service';
import PhotoService from 'src/services/photo-service';
import { albumStore } from 'stores/album-store';
import { computed, ref, toRefs, watch } from 'vue';
import { useRoute } from 'vue-router';

const emits = defineEmits(['refreshPhotoList', 'closePhotoDetail']);
const props = defineProps({
  albumId: {
    type: String,
    required: true,
  },
});
const { albumId } = toRefs(props);

const { setMovePhotoDialogState, movePhotoDialogState } = DialogStateComposable();
const { getSelectedPhotoList } = SelectedItemsComposable();

const albumService = new AlbumService();
const photoService = new PhotoService();
const useAlbumStore = albumStore();
const route = useRoute();

const photoKeysArray = computed(
  () =>
    getSelectedPhotoList.value.map((photoKey: string) => {
      const photoKeyArray = photoKey?.split('/');
      return photoKeyArray.length > 1 ? photoKeyArray[1] : photoKeyArray[0];
    }) as string[]
);
let staticAlbums = useAlbumStore.albumList
  .filter((album) => album.id !== albumId.value)
  .map((album) => ({ label: album.albumName, value: album.id }));

const duplicatedPhotoKeys = ref<string[]>([]);
const filteredAlbumsList = ref(staticAlbums);
const selectedAlbumModel = ref(filteredAlbumsList.value[0] ?? { label: '', value: '' });
const selectedYear = ref((route.params.year as string) || useAlbumStore.selectedYear || 'na');
const isProcessing = ref(false);
const isLoadingAlbums = ref(false);
const needToRefreshPhotoList = ref(false);

const setSelectedYear = (year: string) => {
  selectedYear.value = year;
};

const filterAlbumsFunction = (input: string, update: any) => {
  if (input === '') {
    update(() => {
      filteredAlbumsList.value = staticAlbums.filter((album) => album.value !== albumId.value);
    });
    return;
  }

  update(() => {
    const needle = input.toLowerCase();
    filteredAlbumsList.value = staticAlbums.filter(
      (album) => album.label.toLowerCase().indexOf(needle) > -1 && album.value !== albumId.value
    );
  });
};

const confirmMovePhotos = async () => {
  isProcessing.value = true;
  const photosInSelectedAlbum = await photoService.getPhotosByAlbumId(
    selectedAlbumModel.value.value,
    selectedYear.value
  );
  const tempDuplicatedPhotoKeys =
    photosInSelectedAlbum.data?.photos
      ?.filter((photo) => photoKeysArray.value.includes(photo.key.split('/')[1]))
      .map((photo) => photo.key.split('/')[1]) ?? [];

  let filteredPhotoKeys = photoKeysArray.value;
  // Remove duplicated photos from the list
  if (tempDuplicatedPhotoKeys.length > 0) {
    filteredPhotoKeys = photoKeysArray.value.filter((photoKey) => !tempDuplicatedPhotoKeys.includes(photoKey));
  }
  if (filteredPhotoKeys.length === 0) {
    duplicatedPhotoKeys.value = tempDuplicatedPhotoKeys;
    isProcessing.value = false;
    return;
  }

  // Only move photos that not exist in the selected album
  const result = await photoService.movePhotos(albumId?.value, selectedAlbumModel.value.value, filteredPhotoKeys);
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
// Fetch albums when selected year changes
watch(selectedYear, async (newValue) => {
  if (newValue) {
    isLoadingAlbums.value = true;
    const { data } = await albumService.getAlbumsByYear(newValue);
    if (data && data.length > 0) {
      staticAlbums = data
        .filter((album) => album.id !== albumId.value)
        .map((album) => ({ label: album.albumName, value: album.id }));
      selectedAlbumModel.value = staticAlbums[0] ?? { label: '', value: '' };
    }
    isLoadingAlbums.value = false;
  }
});
</script>
