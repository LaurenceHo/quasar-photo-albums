<template>
  <q-dialog v-model="getUpdateAlbumTagsDialogState" persistent>
    <q-card style="min-width: 400px">
      <q-card-section class="flex justify-between">
        <div class="text-h6">Album tags</div>
        <q-btn icon="mdi-tag-plus" outline color="primary" text-color="primary" />
      </q-card-section>
      <q-card-section style="max-height: 50vh" class="scroll">
        <q-list separator>
          <q-item v-for="tag in albumTags" :key="tag">
            <q-item-section>{{ tag }}</q-item-section>
            <q-item-section side>
              <q-btn-group outline>
                <q-btn icon="mdi-delete" color="primary" dense outline />
                <q-btn icon="mdi-pencil" color="primary" dense outline />
              </q-btn-group>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
      <q-card-actions align="right" class="text-primary">
        <q-btn :disable="isProcessing" flat label="Ok" no-caps @click="setUpdateAlbumTagsDialogState(false)" />
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

const albumTags = computed(() => store.albumTags);
</script>
