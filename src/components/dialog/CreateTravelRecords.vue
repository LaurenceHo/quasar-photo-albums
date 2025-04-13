<template>
  <Dialog
    v-model:visible="createTravelRecordsDialogState"
    :closable="false"
    class="w-80"
    data-test-id="show-travel-records-dialog"
    modal
  >
    <template #header>
      <span class="text-xl font-semibold">New travel records</span>
    </template>
    <form @submit.prevent="validateAndSubmit" @reset.prevent="onReset">
      <div class="mb-4">
        <InputText
          v-model="tagName"
          :disabled="isCreatingTag"
          :invalid="v$.tagName.$invalid && v$.tagName.$dirty"
          class="w-full"
          data-test-id="input-album-tag"
          placeholder="Tag"
          @blur="v$.tagName.$touch()"
          @input="v$.tagName.$touch()"
        />
        <div class="mt-1 flex items-center justify-between">
          <small v-if="v$.tagName.$error" class="text-red-600">
            {{ v$.tagName.$errors[0].$message }}
          </small>
          <small class="ml-auto text-gray-500">{{ tagName.length }}/20</small>
        </div>
      </div>
      <div class="flex justify-end">
        <Button :disabled="isCreatingTag" class="mr-2" label="Cancel" text @click="onReset" />
        <Button :disabled="v$.$invalid" :loading="isCreatingTag" label="Save" type="submit" />
      </div>
    </form>
  </Dialog>
</template>

<script lang="ts" setup>
import useAlbumTags from '@/composables/use-album-tags';
import useDialog from '@/composables/use-dialog';
import { AlbumTagService } from '@/services/album-tag-service';
import { useMutation } from '@tanstack/vue-query';
import { useVuelidate } from '@vuelidate/core';
import { helpers, maxLength, minLength, required } from '@vuelidate/validators';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import { useToast } from 'primevue/usetoast';
import { computed, ref } from 'vue';

const toast = useToast();

const { createTravelRecordsDialogState, setCreateTravelRecordsDialogState } = useDialog();
const { fetchAlbumTags } = useAlbumTags();

const tagName = ref('');

const rules = computed(() => ({
  tagName: {
    required: helpers.withMessage('This field is required.', required),
    minLength: helpers.withMessage('Tag must be at least 2 characters long.', minLength(2)),
    maxLength: helpers.withMessage('Tag cannot exceed 20 characters.', maxLength(20)),
    alphaNum: helpers.withMessage(
      'Tag must contain only lowercase letters and numbers.',
      helpers.regex(/^[a-z0-9]+$/),
    ),
  },
}));

const v$ = useVuelidate(rules, { tagName });

const validateAndSubmit = async () => {
  const isFormCorrect = await v$.value.$validate();
  if (isFormCorrect) {
    createAlbumTag();
  }
};

const { isPending: isCreatingTag, mutate: createAlbumTag } = useMutation({
  mutationFn: () => AlbumTagService.createAlbumTags([{ tag: tagName.value }]),
  onSuccess: async () => {
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: `Tag "${tagName.value}" created.`,
      life: 3000,
    });
    await fetchAlbumTags(true);
    onReset();
  },
  onError: () => {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Error while creating tag. Please try again later.',
      life: 3000,
    });
  },
});

const onReset = () => {
  setCreateTravelRecordsDialogState(false);
  tagName.value = '';
};
</script>
