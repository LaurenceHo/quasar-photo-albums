<template>
  <q-dialog v-model="getUpdateAlbumDialogState" persistent>
    <q-card style="min-width: 500px">
      <q-card-section>
        <div class="text-h6">{{ getAlbumToBeUpdate.id ? 'Edit' : 'New' }} Album</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-input
          v-model="albumId"
          autofocus
          class="q-pb-lg"
          label="Album id"
          outlined
          stack-label
          counter
          maxlength="50"
          :hint="getAlbumToBeUpdate.id ? '' : 'Once album is created, album id cannot be changed.'"
          :disable="getAlbumToBeUpdate.id !== ''"
          :rules="[
            (val: string) => !!val || 'Album id is required',
            (val: string) => /^[A-Za-z0-9\s-]*$/.test(val) || 'Only alphanumeric, space and dash are allowed',
          ]"
        />
        <q-input
          v-model="albumName"
          autofocus
          class="q-pb-lg"
          label="Album name"
          outlined
          stack-label
          counter
          maxlength="50"
          :rules="[(val) => !!val || 'Album name is required']"
        />
        <q-input
          v-model="albumDesc"
          :disable="isProcessing"
          autofocus
          class="q-pb-lg"
          label="Album description"
          outlined
          stack-label
          counter
          maxlength="200"
        />
        <q-select
          v-model="selectedAlbumTags"
          :options="albumTags"
          option-value="tag"
          option-label="tag"
          emit-value
          clearable
          input-debounce="0"
          label="Category"
          multiple
          outlined
          use-chips
          use-input
          @filter="filterTags"
        />
        <q-toggle
          v-model="privateAlbum"
          :disable="isProcessing"
          checked-icon="mdi-lock"
          color="primary"
          icon="mdi-lock-open"
          label="Private album?"
          left-label
        />
      </q-card-section>

      <q-card-actions align="right" class="text-primary">
        <q-btn :disable="isProcessing" flat label="Cancel" no-caps @click="resetAlbum" />
        <q-btn
          :loading="isProcessing"
          :label="getAlbumToBeUpdate.id ? 'Update' : 'Create'"
          no-caps
          unelevated
          color="primary"
          @click="confirmUpdateAlbum"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { Album } from 'components/models';
import AlbumTagsFilterComposable from 'src/composables/album-tags-filter-composable';
import DialogStateComposable from 'src/composables/dialog-state-composable';
import AlbumService from 'src/services/album-service';
import { albumStore } from 'stores/album-store';
import { computed, ref, watch } from 'vue';

const albumService = new AlbumService();
const store = albumStore();

const { getUpdateAlbumDialogState, setUpdateAlbumDialogState, getAlbumToBeUpdate, setAlbumToBeUpdated } =
  DialogStateComposable();
const { albumTags, filterTags } = AlbumTagsFilterComposable();

const albumId = ref('');
const albumName = ref('');
const albumDesc = ref('');
const privateAlbum = ref(false);
const selectedAlbumTags = ref([] as string[]);
const isProcessing = ref(false);

const amountOfAllAlbums = computed(() => store.allAlbumList.length);

const confirmUpdateAlbum = async () => {
  isProcessing.value = true;

  const albumToBeSubmitted = {
    id: getAlbumToBeUpdate.value.id || albumId.value,
    albumCover: getAlbumToBeUpdate.value.albumCover,
    albumName: albumName.value,
    description: albumDesc.value,
    isPrivate: privateAlbum.value,
    tags: selectedAlbumTags.value,
    order: getAlbumToBeUpdate.value.id ? getAlbumToBeUpdate.value.order : amountOfAllAlbums.value,
  } as Album;

  let result;
  if (getAlbumToBeUpdate.value.id) {
    result = await albumService.updateAlbum(albumToBeSubmitted);
  } else {
    result = await albumService.createAlbum(albumToBeSubmitted);
  }

  isProcessing.value = false;
  if (result.status !== 'Error') {
    store.updateAlbum(albumToBeSubmitted, false);
    resetAlbum();
  }
};

const resetAlbum = () => {
  setAlbumToBeUpdated({ id: '', albumName: '', albumCover: '', description: '', tags: [], isPrivate: true, order: 0 });
  setUpdateAlbumDialogState(false);
};

watch(
  getUpdateAlbumDialogState,
  (newValue) => {
    if (newValue) {
      albumId.value = getAlbumToBeUpdate.value.id;
      albumName.value = getAlbumToBeUpdate.value.albumName;
      albumDesc.value = getAlbumToBeUpdate.value.description || '';
      privateAlbum.value = getAlbumToBeUpdate.value.isPrivate;
      selectedAlbumTags.value = getAlbumToBeUpdate.value.tags;
    }
  },
  { deep: true, immediate: true }
);
</script>
