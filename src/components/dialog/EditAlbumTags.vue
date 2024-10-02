<template>
  <Dialog
    v-model:visible="updateAlbumTagsDialogState"
    :breakpoints="{ '960px': '75vw', '641px': '90vw' }"
    class="w-96"
    modal
  >
    <template #header>
      <div class="flex items-center">
        <Button
          class="p-button-icon-only"
          data-test-id="create-tag-button"
          rounded
          severity="secondary"
          text
          @click="createTagDialog = true"
        >
          <IconPlus :size="24" />
        </Button>
        <span class="text-xl font-semibold ml-2">Album tags</span>
      </div>
    </template>
    <div class="max-h-[50vh] overflow-y-auto">
      <ul class="list-none p-0 m-0 divide-y">
        <li v-for="(albumTag, i) in albumTags" :key="albumTag.tag" class="flex justify-between items-center py-2">
          <span>{{ albumTag.tag }}</span>
          <Button
            :data-test-id="`delete-tag-button-${i}`"
            severity="secondary"
            text
            @click="
              () => {
                deleteTagDialog = true;
                tagName = albumTag.tag;
              }
            "
          >
            <IconTrash :size="24" />
          </Button>
        </li>
      </ul>
    </div>
  </Dialog>

  <Dialog v-model:visible="createTagDialog" class="w-80" data-test-id="create-tag-dialog" modal>
    <template #header>
      <span class="text-xl font-semibold">New tag</span>
    </template>
    <form @submit.prevent="validateAndSubmit" @reset.prevent="onReset">
      <div class="mb-4">
        <InputText
          v-model="tagName"
          :invalid="v$.tagName.$invalid && v$.tagName.$dirty"
          class="w-full"
          data-test-id="input-album-tag"
          placeholder="Tag"
          @input="v$.tagName.$touch"
        />
        <small v-if="v$.tagName.$error" class="text-red-500">
          <span v-if="v$.tagName.required.$invalid">This field is required.</span>
          <span v-else-if="v$.tagName.minLength.$invalid">Tag must be at least 2 characters long.</span>
          <span v-else-if="v$.tagName.maxLength.$invalid">Tag cannot exceed 20 characters.</span>
          <span v-else-if="v$.tagName.alphaNum.$invalid">Tag must contain only lowercase letters and numbers.</span>
        </small>
      </div>
      <div class="flex justify-end">
        <Button :disabled="isCreatingTag" class="mr-2" label="Cancel" text @click="createTagDialog = false" />
        <Button :disabled="v$.$invalid" :loading="isCreatingTag" label="Confirm" type="submit" />
      </div>
    </form>
  </Dialog>

  <Dialog v-model:visible="deleteTagDialog" class="w-96" data-test-id="delete-tag-dialog" modal>
    <template #header>
      <div class="flex">
        <IconAlertCircle :size="40" class="text-red-400 pr-2 flex-shrink-0" />
        <span class="text-xl font-semibold" data-test-id="confirm-delete-album-dialog-title">
          Do you want to delete tag "{{ tagName }}"?
        </span>
      </div>
    </template>
    <template #footer>
      <Button
        :disabled="isDeletingTag"
        class="mr-2"
        label="Cancel"
        text
        @click="
          () => {
            reset();
            deleteTagDialog = false;
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
  <Toast position="bottom-center" />
</template>

<script lang="ts" setup>
import AlbumTagsContext from '@/composables/album-tags-context';
import AlbumsContext, { type FilteredAlbumsByYear } from '@/composables/albums-context';
import DialogContext from '@/composables/dialog-context';
import { AlbumTagService } from '@/services/album-tag-service';
import { FILTERED_ALBUMS_BY_YEAR } from '@/utils/local-storage-key';
import { IconAlertCircle, IconPlus, IconTrash } from '@tabler/icons-vue';
import { useMutation } from '@tanstack/vue-query';
import { useVuelidate } from '@vuelidate/core';
import { helpers, maxLength, minLength, required } from '@vuelidate/validators';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const toast = useToast();
const { updateAlbumTagsDialogState } = DialogContext();
const { albumTags, fetchAlbumTags } = AlbumTagsContext();
const { fetchAlbumsByYear } = AlbumsContext();

const createTagDialog = ref(false);
const deleteTagDialog = ref(false);
const tagName = ref('');

const paramsYear = computed(() => route.params['year'] as string);
const filteredAlbumsByYear: FilteredAlbumsByYear = JSON.parse(<string>localStorage.getItem(FILTERED_ALBUMS_BY_YEAR));

const rules = {
  tagName: {
    required,
    minLength: minLength(2),
    maxLength: maxLength(20),
    alphaNum: helpers.regex(/^[a-z0-9]+$/)
  }
};

const v$ = useVuelidate(rules, { tagName });

const validateAndSubmit = async () => {
  const isFormCorrect = await v$.value.$validate();
  if (isFormCorrect) {
    confirmCreateTag();
  }
};

const { isPending: isCreatingTag, mutate: createAlbumTag } = useMutation({
  mutationFn: () => AlbumTagService.createAlbumTags([{ tag: tagName.value }]),
  onSuccess: async () => {
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: `Tag "${tagName.value}" created.`,
      life: 3000
    });
    await fetchAlbumTags(true);
    createTagDialog.value = false;
    tagName.value = '';
  },
  onError: () => {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Error while creating tag. Please try again later.',
      life: 3000
    });
  }
});

const {
  isPending: isDeletingTag,
  mutate: deleteAlbumTag,
  reset
} = useMutation({
  mutationFn: () => AlbumTagService.deleteAlbumTag(tagName.value),
  onSuccess: async () => {
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: `Tag "${tagName.value}" deleted.`,
      life: 3000
    });
    await fetchAlbumTags(true);
    await fetchAlbumsByYear(paramsYear.value || filteredAlbumsByYear?.year, true);
    deleteTagDialog.value = false;
    tagName.value = '';
  },
  onError: () => {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Error while deleting tag. Please try again later.',
      life: 3000
    });
  }
});

const confirmCreateTag = () => {
  createAlbumTag();
};

const confirmDeleteTag = (e: MouseEvent) => {
  e.preventDefault();
  deleteAlbumTag();
};

const onReset = () => {
  tagName.value = '';
};
</script>
