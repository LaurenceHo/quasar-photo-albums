<template>
  <q-btn
    v-if="userPermission.role === 'admin'"
    :class="{ 'grid-album-edit-button': albumStyle === 'grid' }"
    :color="albumStyle === 'grid' ? 'white' : 'dark'"
    flat
    icon="mdi-dots-vertical"
    round
  >
    <q-menu>
      <q-list style="min-width: 100px">
        <q-item v-close-popup clickable @click="editAlbum = true">
          <q-item-section avatar>
            <q-icon color="primary" name="mdi-pencil" />
          </q-item-section>
          <q-item-section>Update album</q-item-section>
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
  <q-dialog v-model="editAlbum" persistent>
    <q-card style="min-width: 500px">
      <q-card-section>
        <div class="text-h6">Edit Album</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-input v-model="albumName" autofocus class="q-pb-md" disable label="Album name" outlined stack-label />
        <q-input v-model="albumDesc" :disable="isProcessing" autofocus label="Album description" outlined stack-label />
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
        <q-btn :loading="isProcessing" flat label="Update" no-caps @click="confirmUpdateAlbum" />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="deleteAlbum" persistent>
    <q-card>
      <q-card-section class="row items-center">
        <q-icon color="primary" name="mdi-alert-circle" size="md" />
        <span class="q-ml-sm text-h6">Do you want to delete album "{{ albumItem.albumName }}"?</span>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn v-close-popup :disable="isProcessing" color="primary" flat label="Cancel" no-caps />
        <q-btn :loading="isProcessing" color="primary" flat label="Confirm" no-caps @click="confirmDeleteAlbum" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { Album } from 'components/models';
import { useQuasar } from 'quasar';
import AlbumService from 'src/services/album-service';
import { albumStore } from 'src/store/album-store';
import { UserPermission, userStore } from 'src/store/user-store';
import { computed, defineProps, ref, toRefs } from 'vue';

const props = defineProps({
  albumStyle: {
    type: String,
    required: true,
  },
  albumItem: {
    type: Object,
    required: true,
    default: () => ({ albumName: '', desc: '', tags: [], private: false }),
  },
});
const { albumItem } = toRefs(props);

const albumService = new AlbumService();
const store = albumStore();
const userPermissionStore = userStore();
const q = useQuasar();

const userPermission = computed(() => userPermissionStore.userPermission as UserPermission);

const editAlbum = ref(false);
const deleteAlbum = ref(false);
const albumName = ref(albumItem?.value?.albumName);
const albumDesc = ref(albumItem?.value?.desc);
const privateAlbum = ref(albumItem?.value?.private);
const albumTags = ref(albumItem?.value?.tags);
const isProcessing = ref(false);

const confirmUpdateAlbum = async () => {
  isProcessing.value = true;
  const albumToBeUpdated = {
    albumName: albumName.value,
    desc: albumDesc.value,
    private: privateAlbum.value,
    tags: albumTags.value,
  };

  try {
    await albumService.updateAlbum(albumToBeUpdated);
    store.updateAlbum(albumToBeUpdated, false);
    editAlbum.value = false;
    q.notify({
      color: 'positive',
      icon: 'mdi-cloud-check-outline',
      message: 'Album updated',
      timeout: 3000,
    });
  } catch (error: any) {
    q.notify({
      color: 'negative',
      icon: 'mdi-alert-circle-outline',
      message: error.toString(),
    });
  } finally {
    isProcessing.value = false;
  }
};

const confirmDeleteAlbum = async () => {
  isProcessing.value = true;

  try {
    await albumService.deleteAlbum(albumItem?.value.albumName);
    store.updateAlbum(albumItem?.value as Album, true);
    deleteAlbum.value = false;
    q.notify({
      color: 'positive',
      icon: 'mdi-cloud-check-outline',
      message: 'Album deleted',
      timeout: 3000,
    });
  } catch (error: any) {
    q.notify({
      color: 'negative',
      icon: 'mdi-alert-circle-outline',
      message: error.toString(),
    });
  } finally {
    isProcessing.value = false;
  }
};

const resetAlbum = () => {
  albumName.value = albumItem?.value?.albumName;
  albumDesc.value = albumItem?.value?.desc;
  privateAlbum.value = albumItem?.value?.private;
  albumTags.value = albumItem?.value?.tags;
  editAlbum.value = false;
};
</script>
<style lang="scss">
.grid-album-edit-button {
  top: 0;
  right: 0;
  position: absolute;
}
</style>
