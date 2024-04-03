<template>
  <div class="photo-item col-xl-2 col-lg-2 col-md-3 col-sm-4 col-xs-6" data-test-id="photo-item">
    <div class="relative-position">
      <q-img
        :id="`photo-image-${photo.key}`"
        :ratio="1"
        :src="`${photo.url}?tr=w-${imageWidth},h-${imageWidth}`"
        class="rounded-borders-lg cursor-pointer"
        :alt="`photo image ${photo.key}`"
        @click="goToPhotoDetail()"
      />
      <div v-if="isAdminUser" class="absolute-top flex justify-between photo-top-button-container">
        <q-checkbox
          v-model="selectedPhotosList"
          data-test-id="select-photo-checkbox"
          :val="photo.key"
          checked-icon="mdi-check-circle"
          color="positive"
          unchecked-icon="mdi-check-circle"
        >
          <q-tooltip> Select photo</q-tooltip>
        </q-checkbox>
        <EditPhotoButton
          data-test-id="edit-photo-button"
          :photo-key="photo.key"
          color="white"
          @refresh-photo-list="$emit('refreshPhotoList')"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import EditPhotoButton from 'components/button/EditPhotoButton.vue';
import SelectedItemsComposable from 'src/composables/selected-items-composaable';
import { userStore } from 'stores/user-store';
import { computed, onMounted, ref, toRefs } from 'vue';
import { useRouter } from 'vue-router';

defineEmits(['refreshPhotoList']);
const props = defineProps({
  photo: {
    type: Object,
    required: true,
    default: () => ({ key: '', url: '' }),
  },
});

const { photo } = toRefs(props);
const router = useRouter();
const userPermissionStore = userStore();
const { selectedPhotosList } = SelectedItemsComposable();
const isAdminUser = computed(() => userPermissionStore.isAdminUser);

const imageWidth = ref(document.getElementById('photo-image')?.clientWidth ?? 0);

const goToPhotoDetail = () => {
  const photoId = photo.value.key.split('/')[1];
  router.replace({ query: { photo: photoId } });
};

onMounted(() => {
  imageWidth.value = document.getElementById('photo-image')?.clientWidth ?? 250;
});
</script>
