<template>
  <Dialog
    v-model:visible="showTravelRecordsDialogState"
    :breakpoints="{ '960px': '75vw', '641px': '90vw' }"
    :closable="false"
    class="w-96"
    modal
  >
    <template #header>
      <div class="flex items-center">
        <Button
          data-test-id="create-travel-record-button"
          severity="secondary"
          text
          @click="setCreateTravelRecordsDialogState(true)"
        >
          <IconPlus :size="24" />
        </Button>
        <span class="ml-2 text-xl font-semibold">Travel Records</span>
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
            @click="
              () => {
                deleteTravelRecord = true;
                tagName = albumTag.tag;
              }
            "
          >
            <IconTrash :size="24" />
          </Button>
        </li>
      </ul>
    </div>
    <template #footer>
      <Button label="Close" text @click="setShowTravelRecordsDialogState(false)" />
    </template>
  </Dialog>

  <Dialog
    v-model:visible="deleteTravelRecord"
    :closable="false"
    class="w-96"
    data-test-id="delete-tag-dialog"
    modal
  >
    <template #header>
      <div class="flex">
        <IconAlertCircle :size="40" class="flex-shrink-0 pr-2 text-red-400" />
        <span class="text-xl font-semibold" data-test-id="confirm-delete-album-dialog-title">
          Do you want to delete tag "{{ tagName }}"?
        </span>
      </div>
    </template>
    <template #footer>
      <Button
        :disabled="isDeletingTag"
        label="Cancel"
        text
        @click="
          () => {
            reset();
            deleteTravelRecord = false;
          }
        "
      />
      <Button
        :loading="isDeletingTag"
        autofocus
        data-test-id="confirm-delete-tag-button"
        label="Confirm"
        @click="confirmDeleteTag"
      />
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import useAlbumTags from '@/composables/use-album-tags';
import useAlbums, { type FilteredAlbumsByYear } from '@/composables/use-albums';
import useDialog from '@/composables/use-dialog';
import { AlbumTagService } from '@/services/album-tag-service';
import { FILTERED_ALBUMS_BY_YEAR } from '@/utils/local-storage-key';
import { IconAlertCircle, IconPlus, IconTrash } from '@tabler/icons-vue';
import { useMutation } from '@tanstack/vue-query';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import { useToast } from 'primevue/usetoast';
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const toast = useToast();

const {
  showTravelRecordsDialogState,
  setShowTravelRecordsDialogState,
  setCreateTravelRecordsDialogState,
} = useDialog();
const { albumTags, fetchAlbumTags } = useAlbumTags();
const { fetchAlbumsByYear } = useAlbums();

const deleteTravelRecord = ref(false);
const tagName = ref('');

const paramsYear = computed(() => route.params['year'] as string);
const filteredAlbumsByYear: FilteredAlbumsByYear = JSON.parse(
  <string>localStorage.getItem(FILTERED_ALBUMS_BY_YEAR),
);

const {
  isPending: isDeletingTag,
  mutate: deleteAlbumTag,
  reset,
} = useMutation({
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
    deleteTravelRecord.value = false;
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

const confirmDeleteTag = (e: MouseEvent) => {
  e.preventDefault();
  deleteAlbumTag();
};
</script>
