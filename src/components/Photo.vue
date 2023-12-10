<template>
  <div class="photo-item col-xl-2 col-lg-2 col-md-3 col-sm-4 col-xs-6" data-test-id="photo-item">
    <div class="relative-position">
      <q-img
        :ratio="1"
        :src="`${photo.url}?tr=w-250,h-250`"
        class="rounded-borders-lg cursor-pointer"
        @click="goToPhotoDetail()"
      />
      <div class="absolute-top flex justify-between photo-top-button-container">
        <q-checkbox
          v-if="isAdminUser"
          v-model="selectedPhotosList"
          :val="photo.key"
          checked-icon="mdi-check-circle"
          color="positive"
          unchecked-icon="mdi-check-circle"
        >
          <q-tooltip> Select photo </q-tooltip>
        </q-checkbox>
        <EditPhotoButton
          v-if="isAdminUser"
          :album-item="albumItem"
          :is-album-cover="photo.key === albumItem?.albumCover"
          :photo-key="photo.key"
          color="white"
          @refreshPhotoList="$emit('refreshPhotoList')"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import EditPhotoButton from 'components/button/EditPhotoButton.vue';
import { Album } from 'components/models';
import DialogStateComposable from 'src/composables/dialog-state-composable';
import { computed, toRefs } from 'vue';
import { userStore } from 'stores/user-store';
import { photoStore } from 'stores/photo-store';
import { useRouter } from 'vue-router';

const props = defineProps({
  index: {
    type: Number,
    required: true,
  },
  albumItem: {
    type: Object,
    required: true,
    default: () => ({ id: '', albumName: '', desc: '', tags: [], isPrivate: false, order: 0, place: null }) as Album,
  },
  photo: {
    type: Object,
    required: true,
    default: () => ({ key: '', url: '' }),
  },
});

const { index, photo } = toRefs(props);
const router = useRouter();
const usePhotoStore = photoStore();
const userPermissionStore = userStore();
const { selectedPhotosList } = DialogStateComposable();
const isAdminUser = computed(() => userPermissionStore.isAdminUser);

const goToPhotoDetail = () => {
  usePhotoStore.$patch({ selectedImageIndex: index.value });
  const photoKeyForUrl = photo.value.key.split('/')[1];
  router.replace({ query: { photo: photoKeyForUrl } });
};
</script>
