<template>
  <Dialog
    v-model:visible="showAlbumTagsDialogState"
    :breakpoints="{ '960px': '75vw', '641px': '90vw' }"
    :closable="false"
    class="w-96"
    modal
  >
    <template #header>
      <div class="flex items-center">
        <Button
          data-test-id="create-tag-button"
          severity="secondary"
          text
          @click="setCreateAlbumTagDialogState(true)"
        >
          <IconPlus :size="24" />
        </Button>
        <span class="ml-2 text-xl font-semibold">Album tags</span>
      </div>
    </template>
    <div class="max-h-[50vh] overflow-y-auto">
      <ul class="m-0 list-none divide-y p-0">
        <li
          v-for="(albumTag, i) in albumTags"
          :key="albumTag.tag"
          class="flex items-center justify-between py-2"
        >
          <span>{{ albumTag.tag }}</span>
          <Button
            :data-test-id="`delete-tag-button-${i}`"
            severity="secondary"
            text
            @click="confirmDelete(albumTag.tag)"
          >
            <IconTrash :size="24" />
          </Button>
        </li>
      </ul>
    </div>
    <template #footer>
      <Button label="Close" text @click="setShowAlbumTagsDialogState(false)" />
    </template>
  </Dialog>

  <ConfirmDialog>
    <template #message="slotProps">
      <div class="flex items-center">
        <IconAlertCircle :size="40" class="flex-shrink-0 pr-2 text-red-400" />
        <span class="text-xl font-semibold" data-test-id="confirm-delete-album-dialog-title">
          {{ slotProps.message.message }} "{{ tagName }}"?
        </span>
      </div>
    </template>
  </ConfirmDialog>
</template>

<script lang="ts" setup>
import { useAlbumTags, useAlbums } from '@/composables';
import { type FilteredAlbumsByYear } from '@/composables/use-albums';
import { AlbumTagService } from '@/services/album-tag-service';
import { FILTERED_ALBUMS_BY_YEAR } from '@/utils/local-storage-key';
import { IconAlertCircle, IconPlus, IconTrash } from '@tabler/icons-vue';
import { useMutation } from '@tanstack/vue-query';
import { storeToRefs } from 'pinia';
import { Button, ConfirmDialog, Dialog, useConfirm, useToast } from 'primevue';
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useDialogStore } from '@/stores';

const confirm = useConfirm();
const route = useRoute();
const toast = useToast();
const dialogStore = useDialogStore();
const { setShowAlbumTagsDialogState, setCreateAlbumTagDialogState } = dialogStore;
const { showAlbumTagsDialogState } = storeToRefs(dialogStore);
const { albumTags, fetchAlbumTags } = useAlbumTags();
const { fetchAlbumsByYear } = useAlbums();

const tagName = ref('');

const paramsYear = computed(() => route.params['year'] as string);
const filteredAlbumsByYear: FilteredAlbumsByYear = JSON.parse(
  <string>localStorage.getItem(FILTERED_ALBUMS_BY_YEAR),
);

const confirmDelete = (tag: string) => {
  tagName.value = tag;
  confirm.require({
    message: 'Do you want to delete tag',
    header: 'Confirmation',
    rejectProps: {
      label: 'Cancel',
      text: true,
    },
    acceptProps: {
      label: 'Confirm',
    },
    accept: () => {
      deleteAlbumTag();
    },
    reject: () => {
      reset();
    },
  });
};

const { mutate: deleteAlbumTag, reset } = useMutation({
  mutationFn: async () => await AlbumTagService.deleteAlbumTag(tagName.value),
  onSuccess: async () => {
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: `Tag "${tagName.value}" deleted.`,
      life: 3000,
    });
    await fetchAlbumTags(true);
    await fetchAlbumsByYear(paramsYear.value || filteredAlbumsByYear?.year, true);
    tagName.value = '';
  },
  onError: () => {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Error while deleting tag. Please try again later.',
      life: 3000,
    });
  },
});
</script>
