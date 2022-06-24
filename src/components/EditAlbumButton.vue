<template>
  <q-btn
    v-if="userPermission.role === 'admin'"
    :class="{ 'absolute-top-right': albumStyle === 'grid' }"
    :color="albumStyle === 'grid' ? 'white' : 'dark'"
    flat
    icon="mdi-dots-vertical"
    round
  >
    <q-menu>
      <q-list style="min-width: 100px">
        <q-item v-close-popup clickable @click="setAlbum">
          <q-item-section avatar>
            <q-icon color="primary" name="mdi-pencil" />
          </q-item-section>
          <q-item-section>Edit album</q-item-section>
        </q-item>
        <q-item v-close-popup clickable @click="deleteAlbum = true">
          <q-item-section avatar>
            <q-icon color="primary" name="mdi-delete" />
          </q-item-section>
          <q-item-section>Delete album</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
  <q-dialog v-model="deleteAlbum" persistent>
    <q-card>
      <q-card-section class="row items-center">
        <q-icon color="primary" name="mdi-alert-circle" size="md" />
        <span class="q-ml-sm text-h6">Do you want to delete album "{{ albumItem.albumName }}"?</span>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn v-close-popup :disable="isProcessing" color="primary" flat label="Cancel" no-caps />
        <q-btn :loading="isProcessing" color="primary" unelevated label="Confirm" no-caps @click="confirmDeleteAlbum" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { Album } from 'src/components/models';
import DialogStateComposable from 'src/composables/dialog-state-composable';
import AlbumService from 'src/services/album-service';
import { albumStore } from 'src/stores/album-store';
import { UserPermission, userStore } from 'src/stores/user-store';
import { computed, ref, toRefs } from 'vue';

const props = defineProps({
  albumStyle: {
    type: String,
    required: true,
  },
  albumItem: {
    type: Object,
    required: true,
    default: () => ({ id: '', albumName: '', desc: '', tags: [], private: false } as Album),
  },
});
const { albumItem } = toRefs(props);

const albumService = new AlbumService();
const store = albumStore();
const userPermissionStore = userStore();
const { setUpdateAlbumDialogState, setAlbumToBeUpdated } = DialogStateComposable();

const userPermission = computed(() => userPermissionStore.userPermission as UserPermission);

const deleteAlbum = ref(false);
const albumName = ref(albumItem?.value?.albumName);
const isProcessing = ref(false);

const setAlbum = () => {
  setAlbumToBeUpdated(albumItem.value as Album);
  setUpdateAlbumDialogState(true);
};

const confirmDeleteAlbum = async () => {
  isProcessing.value = true;
  await albumService.deleteAlbum(albumItem?.value.id);
  store.updateAlbum(albumItem?.value as Album, true);
  deleteAlbum.value = false;
  isProcessing.value = false;
};
</script>
