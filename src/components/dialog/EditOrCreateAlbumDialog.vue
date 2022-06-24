<template>
  <q-dialog v-model="getUpdateAlbumDialogState" persistent>
    <q-card style="min-width: 500px">
      <q-card-section>
        <div class="text-h6">{{ getAlbumToBeUpdate.id ? 'Edit' : 'New' }} Album</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-input v-model="albumName" autofocus class="q-pb-md" label="Album name" outlined stack-label />
        <q-input
          v-model="albumDesc"
          :disable="isProcessing"
          autofocus
          class="q-pb-md"
          label="Album description"
          outlined
          stack-label
        />
        <q-select
          v-model="selectedAlbumTags"
          :options="albumTags"
          option-value="id"
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
import AlbumTagsFilterComposable from 'src/composables/album-tags-filter-composable';
import DialogStateComposable from 'src/composables/dialog-state-composable';
import AlbumService from 'src/services/album-service';
import { albumStore } from 'stores/album-store';
import { ref, watch } from 'vue';

const albumService = new AlbumService();
const store = albumStore();

const { getUpdateAlbumDialogState, setUpdateAlbumDialogState, getAlbumToBeUpdate, setAlbumToBeUpdated } =
  DialogStateComposable();
const { albumTags, filterTags } = AlbumTagsFilterComposable();

const albumName = ref('');
const albumDesc = ref('');
const privateAlbum = ref(false);
const selectedAlbumTags = ref([] as string[]);
const isProcessing = ref(false);

const confirmUpdateAlbum = async () => {
  isProcessing.value = true;

  const albumToBeSubmitted = {
    id: getAlbumToBeUpdate.value.id || albumName.value,
    albumName: albumName.value,
    desc: albumDesc.value,
    private: privateAlbum.value,
    tags: selectedAlbumTags.value,
  };

  if (getAlbumToBeUpdate.value.id) {
    await albumService.updateAlbum(albumToBeSubmitted);
  } else {
    await albumService.createAlbum(albumToBeSubmitted);
  }
  store.updateAlbum(albumToBeSubmitted, false);
  setUpdateAlbumDialogState(false);
  isProcessing.value = false;
};

const resetAlbum = () => {
  setAlbumToBeUpdated({ id: '', albumName: '', desc: '', tags: [], private: false });
  setUpdateAlbumDialogState(false);
};

watch(
  getUpdateAlbumDialogState,
  (newValue) => {
    if (newValue) {
      albumName.value = getAlbumToBeUpdate.value.albumName;
      albumDesc.value = getAlbumToBeUpdate.value.desc;
      privateAlbum.value = getAlbumToBeUpdate.value.private;
      selectedAlbumTags.value = getAlbumToBeUpdate.value.tags;
    }
  },
  { deep: true, immediate: true }
);
</script>
