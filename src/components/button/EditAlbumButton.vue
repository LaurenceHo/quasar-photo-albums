<template>
  <q-btn
    :class="{ 'absolute-top-right': albumStyle === 'grid' }"
    :color="albumStyle === 'grid' ? 'white' : 'dark'"
    flat
    icon="mdi-dots-vertical"
    round
    data-test-id="edit-album-button"
  >
    <q-menu>
      <q-list style="min-width: 100px">
        <q-item v-close-popup clickable data-test-id="set-album-button" @click="setAlbum">
          <q-item-section avatar>
            <q-icon color="primary" name="mdi-pencil" />
          </q-item-section>
          <q-item-section>Edit Album</q-item-section>
        </q-item>
        <q-item v-close-popup clickable data-test-id="delete-album-button" @click="deleteAlbum = true">
          <q-item-section avatar>
            <q-icon color="primary" name="mdi-delete" />
          </q-item-section>
          <q-item-section>Delete Album</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
  <q-dialog v-model="deleteAlbum" persistent data-test-id="confirm-delete-album-dialog">
    <q-card>
      <q-card-section class="row items-center">
        <q-icon color="primary" name="mdi-alert-circle" size="md" />
        <span class="q-ml-sm text-h6" data-test-id="confirm-delete-album-dialog-title">
          Do you want to delete album "{{ albumName }}"?
        </span>
        <span class="q-ma-sm text-subtitle2">
          All photos in this album will be deleted, and any new photos added while the delete action is in progress
          might also be deleted.
        </span>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn v-close-popup :disable="isProcessing" color="primary" flat label="Cancel" no-caps />
        <q-btn
          :loading="isProcessing"
          color="primary"
          label="Confirm"
          no-caps
          unelevated
          data-test-id="confirm-delete-album-button"
          @click="confirmDeleteAlbum"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import DialogStateComposable from 'src/composables/dialog-state-composable';
import SelectedItemsComposable from 'src/composables/selected-items-composaable';
import AlbumService from 'src/services/album-service';
import { Album } from 'src/types';
import { albumStore } from 'stores/album-store';
import { computed, ref, toRefs } from 'vue';
import { useRoute } from 'vue-router';

const props = defineProps({
  albumStyle: {
    type: String,
    required: true,
  },
  albumItem: {
    type: Object as () => Album,
    required: true,
    default: () =>
      ({
        year: '',
        id: '',
        albumCover: '',
        albumName: '',
        description: '',
        tags: [],
        isPrivate: true,
      }) as Album,
  },
});
const { albumItem } = toRefs(props);

const route = useRoute();
const albumService = new AlbumService();
const store = albumStore();
const { setUpdateAlbumDialogState } = DialogStateComposable();
const { setAlbumToBeUpdated } = SelectedItemsComposable();

const paramsYear = computed(() => route.params['year'] as string);

const deleteAlbum = ref(false);
const albumName = ref(albumItem.value['albumName']);
const isProcessing = ref(false);

const setAlbum = () => {
  setAlbumToBeUpdated(albumItem.value as Album);
  setUpdateAlbumDialogState(true);
};

const confirmDeleteAlbum = async () => {
  isProcessing.value = true;
  const result = await albumService.deleteAlbum(albumItem.value['id'], albumItem.value['year']);
  if (result.code === 200) {
    await store.getAlbumsByYear(paramsYear.value, true);
  }
  deleteAlbum.value = false;
  isProcessing.value = false;
};
</script>
