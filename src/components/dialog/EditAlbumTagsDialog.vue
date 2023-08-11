<template>
  <q-dialog v-model="updateAlbumTagsDialogState">
    <q-card style="min-width: 400px">
      <q-card-section class="flex justify-between">
        <div class="text-h6">Album tags</div>
        <q-btn icon="mdi-tag-plus" outline color="primary" text-color="primary" @click="createTagDialog = true" />
      </q-card-section>
      <q-card-section style="max-height: 50vh" class="scroll">
        <q-list separator>
          <q-item v-for="albumTag in albumTags" :key="albumTag.tag">
            <q-item-section>{{ albumTag.tag }}</q-item-section>
            <q-item-section side>
              <q-btn icon="mdi-delete" color="primary" dense flat @click="openDeleteDialog(albumTag.tag)" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-dialog>

  <q-dialog v-model="createTagDialog" persistent transition-show="scale" transition-hide="scale">
    <q-card style="width: 300px">
      <q-card-section>
        <div class="text-h6">New tag</div>
      </q-card-section>

      <q-form @submit="confirmCreateTag" @reset="onReset">
        <q-card-section class="q-pt-none">
          <q-input
            v-model="tagName"
            autofocus
            class="q-pb-md"
            label="Tag"
            outlined
            stack-label
            :rules="[(val) => (val && val.length > 0) || 'Please type something']"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            :disable="isProcessing"
            color="primary"
            flat
            label="Cancel"
            no-caps
            @click="createTagDialog = false"
            type="reset"
          />
          <q-btn :loading="isProcessing" color="primary" label="Confirm" no-caps unelevated type="submit" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>

  <q-dialog v-model="deleteTagDialog" persistent>
    <q-card>
      <q-card-section class="row items-center">
        <q-icon color="primary" name="mdi-alert-circle" size="md" />
        <span class="q-ml-sm text-h6">Do you want to delete tag "{{ tagName }}"?</span>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn v-close-popup :disable="isProcessing" color="primary" flat label="Cancel" no-caps />
        <q-btn :loading="isProcessing" color="primary" unelevated label="Confirm" no-caps @click="confirmDeleteAlbum" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import DialogStateComposable from 'src/composables/dialog-state-composable';
import AlbumTagService from 'src/services/album-tag-service';
import { albumStore } from 'stores/album-store';
import { computed, ref } from 'vue';

const albumTagService = new AlbumTagService();
const store = albumStore();
const { updateAlbumTagsDialogState } = DialogStateComposable();

const isProcessing = ref(false);
const createTagDialog = ref(false);
const deleteTagDialog = ref(false);
const tagName = ref('');

const albumTags = computed(() => store.albumTags);

const confirmCreateTag = async () => {
  isProcessing.value = true;
  const tag = {
    tag: tagName.value,
  };

  const result = await albumTagService.createAlbumTag(tag);
  if (result.status !== 'Error') {
    store.updateAlbumTags(tag, false);
  }
  createTagDialog.value = false;
  isProcessing.value = false;
  tagName.value = '';
};

const confirmDeleteAlbum = async () => {
  isProcessing.value = true;
  const result = await albumTagService.deleteAlbumTag(tagName.value);
  if (result.status !== 'Error') {
    store.updateAlbumTags(
      {
        tag: tagName.value,
      },
      true
    );
  }
  deleteTagDialog.value = false;
  isProcessing.value = false;
  tagName.value = '';
};
const openDeleteDialog = (tag: string) => {
  deleteTagDialog.value = true;
  tagName.value = tag;
};

const onReset = () => {
  tagName.value = '';
};
</script>
