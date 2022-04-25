<template>
  <q-dialog v-model="getUpdateAlbumTagsDialogState" persistent>
    <q-card style="min-width: 400px">
      <q-card-section class="flex justify-between">
        <div class="text-h6">Album tags</div>
        <q-btn icon="mdi-tag-plus" outline color="primary" text-color="primary" @click="createTagDialog = true" />
      </q-card-section>
      <q-card-section style="max-height: 50vh" class="scroll">
        <q-list separator>
          <q-item v-for="albumTag in albumTags" :key="albumTag.id">
            <q-item-section>{{ albumTag.tag }}</q-item-section>
            <q-item-section side>
              <q-btn icon="mdi-delete" color="primary" dense flat />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn label="Ok" color="primary" no-caps @click="setUpdateAlbumTagsDialogState(false)" unelevated />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="createTagDialog" persistent transition-show="scale" transition-hide="scale">
    <q-card style="width: 300px">
      <q-card-section>
        <div class="text-h6">New tag</div>
      </q-card-section>

      <q-card-section class="q-pt-none"> Click/Tap on the backdrop.</q-card-section>

      <q-card-actions align="right">
        <q-btn
          v-close-popup
          :disable="isProcessing"
          color="primary"
          flat
          label="Cancel"
          no-caps
          @click="createTagDialog = false"
        />
        <q-btn :loading="isProcessing" color="primary" label="Confirm" no-caps @click="confirmCreateTag" unelevated />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import DialogStateComposable from 'src/composables/dialog-state-composable';
import { albumStore } from 'src/stores/album-store';
import { computed, ref } from 'vue';

const store = albumStore();
const { getUpdateAlbumTagsDialogState, setUpdateAlbumTagsDialogState } = DialogStateComposable();
const isProcessing = ref(false);
const createTagDialog = ref(false);

const albumTags = computed(() => store.albumTags);

const confirmCreateTag = () => {
  // TODO
};
</script>
