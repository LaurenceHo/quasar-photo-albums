<template>
  <q-dialog v-model="updateAlbumTagsDialogState">
    <q-card :style="$q.screen.gt.xs ? 'min-width: 400px' : 'min-width: 360px'">
      <q-card-section class="flex justify-between">
        <div class="text-h6">Album tags</div>
        <q-btn
          color="primary"
          icon="mdi-tag-plus"
          outline
          text-color="primary"
          data-test-id="create-tag-button"
          @click="createTagDialog = true"
        />
      </q-card-section>
      <q-card-section class="scroll" style="max-height: 50vh">
        <q-list separator>
          <q-item v-for="(albumTag, i) in albumTags" :key="albumTag.tag">
            <q-item-section>{{ albumTag.tag }}</q-item-section>
            <q-item-section side>
              <q-btn
                :data-test-id="`delete-tag-button-${i}`"
                color="primary"
                dense
                flat
                icon="mdi-delete"
                @click="openDeleteDialog(albumTag.tag)"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-dialog>

  <q-dialog
    v-model="createTagDialog"
    persistent
    transition-hide="scale"
    transition-show="scale"
    data-test-id="create-tag-dialog"
  >
    <q-card style="width: 300px">
      <q-card-section>
        <div class="text-h6">New tag</div>
      </q-card-section>

      <q-form @submit.prevent="confirmCreateTag" @reset.prevent="onReset">
        <q-card-section class="q-pt-none scroll" style="max-height: 50vh">
          <q-input
            v-model="tagName"
            :rules="[(val: string) => (val && val.length > 0) || 'This field is required']"
            autofocus
            class="q-pb-md"
            label="Tag"
            outlined
            stack-label
            data-test-id="input-album-tag"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            :disable="isProcessing"
            color="primary"
            flat
            label="Cancel"
            no-caps
            type="reset"
            @click="createTagDialog = false"
          />
          <q-btn :loading="isProcessing" color="primary" label="Confirm" no-caps type="submit" unelevated />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>

  <q-dialog v-model="deleteTagDialog" persistent data-test-id="delete-tag-dialog">
    <q-card>
      <q-card-section class="row items-center">
        <q-icon color="primary" name="mdi-alert-circle" size="md" />
        <span class="q-ml-sm text-h6">Do you want to delete tag "{{ tagName }}"?</span>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn v-close-popup :disable="isProcessing" color="primary" flat label="Cancel" no-caps />
        <q-btn
          data-test-id="confirm-delete-tag-button"
          :loading="isProcessing"
          color="primary"
          label="Confirm"
          no-caps
          unelevated
          @click="confirmDeleteTag"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { LocalStorage } from 'quasar';
import DialogStateComposable from 'src/composables/dialog-state-composable';
import AlbumTagService from 'src/services/album-tag-service';
import { albumStore, FILTERED_ALBUMS_BY_YEAR, FilteredAlbumsByYear } from 'stores/album-store';
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';

const albumTagService = new AlbumTagService();
const useAlbumStore = albumStore();
const { updateAlbumTagsDialogState } = DialogStateComposable();
const route = useRoute();

const isProcessing = ref(false);
const createTagDialog = ref(false);
const deleteTagDialog = ref(false);
const tagName = ref('');

const paramsYear = computed(() => route.params['year'] as string);
const albumTags = computed(() => useAlbumStore.albumTags);
const filteredAlbumsByYear: FilteredAlbumsByYear = JSON.parse(<string>LocalStorage.getItem(FILTERED_ALBUMS_BY_YEAR));

const confirmCreateTag = async () => {
  isProcessing.value = true;
  const tag = {
    tag: tagName.value,
  };

  const result = await albumTagService.createAlbumTags([tag]);
  if (result.code === 200) {
    await useAlbumStore.getAlbumsByYear(paramsYear.value || filteredAlbumsByYear?.year, true);
  }
  createTagDialog.value = false;
  isProcessing.value = false;
  tagName.value = '';
};

const confirmDeleteTag = async () => {
  isProcessing.value = true;
  const result = await albumTagService.deleteAlbumTag(tagName.value);
  if (result.code === 200) {
    await useAlbumStore.getAlbumsByYear(paramsYear.value || filteredAlbumsByYear?.year, true);
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
