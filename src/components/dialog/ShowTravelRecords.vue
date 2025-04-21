<template>
  <Dialog
    v-model:visible="showTravelRecordsDialogState"
    :breakpoints="{ '960px': '75vw', '641px': '90vw' }"
    :closable="false"
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
      <DataTable :value="travelRecords" tableStyle="min-width: 20rem">
        <Column field="id" header="Id"></Column>
        <Column field="travelDate" header="Date">
          <template #body="{ data }">
            {{ data.travelDate ? new Date(data.travelDate).toLocaleDateString() : '--' }}
          </template>
        </Column>
        <Column field="departure" header="Departure">
          <template #body="{ data }">
            {{ data.departure.displayName }}
          </template>
        </Column>
        <Column field="destination" header="Destination">
          <template #body="{ data }">
            {{ data.destination.displayName }}
          </template>
        </Column>
        <Column field="manage" header="Manage">
          <template #body="{ data }">
            <Button
              :data-test-id="`delete-record-button-${data.id}`"
              severity="secondary"
              text
              @click="confirmDelete(data.id)"
            >
              <IconTrash :size="24" />
            </Button>
          </template>
        </Column>
      </DataTable>
    </div>
    <template #footer>
      <Button label="Close" text @click="setShowTravelRecordsDialogState(false)" />
    </template>
  </Dialog>
  <ConfirmDialog>
    <template #message="slotProps">
      <div class="flex items-center">
        <IconAlertCircle :size="40" class="flex-shrink-0 pr-2 text-red-400" />
        <span class="text-xl font-semibold" data-test-id="confirm-delete-album-dialog-title">
          {{ slotProps.message.message }} "{{ selectedRecordId }}"?
        </span>
      </div>
    </template>
  </ConfirmDialog>
</template>

<script lang="ts" setup>
import useDialog from '@/composables/use-dialog';
import { TravelRecordService } from '@/services/travel-record-service';
import { useTravelRecordsStore } from '@/stores';
import { IconAlertCircle, IconPlus, IconTrash } from '@tabler/icons-vue';
import { useMutation } from '@tanstack/vue-query';
import { storeToRefs } from 'pinia';
import { Button, Column, ConfirmDialog, DataTable, Dialog, useConfirm, useToast } from 'primevue';
import { ref } from 'vue';

const confirm = useConfirm();
const toast = useToast();

const {
  showTravelRecordsDialogState,
  setShowTravelRecordsDialogState,
  setCreateTravelRecordsDialogState,
} = useDialog();

const travelRecordsStore = useTravelRecordsStore();
const { travelRecords } = storeToRefs(travelRecordsStore);
const selectedRecordId = ref('');

const confirmDelete = (id: string) => {
  selectedRecordId.value = id;

  confirm.require({
    message: 'Do you want to delete record',
    header: 'Confirmation',
    rejectProps: {
      label: 'Cancel',
      text: true,
    },
    acceptProps: {
      label: 'Confirm',
    },
    accept: () => {
      deleteRecord();
    },
    reject: () => {
      reset();
    },
  });
};

const { mutate: deleteRecord, reset } = useMutation({
  mutationFn: async () => await TravelRecordService.deleteTravelRecord(selectedRecordId.value),
  onSuccess: async () => {
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: `Record "${selectedRecordId.value}" deleted.`,
      life: 3000,
    });
    travelRecordsStore.refetchTravelRecords();
    selectedRecordId.value = '';
  },
  onError: () => {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Error while deleting record. Please try again later.',
      life: 3000,
    });
  },
});
</script>
