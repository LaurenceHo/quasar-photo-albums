<template>
  <div
    v-if="photoStyle === 'grid'"
    class="photo-item col-xl-2 col-lg-2 col-md-3 col-sm-4 col-xs-6"
    data-test-id="photo-item"
  >
    <div :class="`relative-position ${isPhotoSelected ? 'photo-selected' : ''}`">
      <q-img
        :id="`photo-image-${photo['key']}`"
        :ratio="1"
        :src="`${photo['url']}?tr=w-${imageWidth},h-${imageWidth}`"
        class="rounded-borders cursor-pointer"
        :alt="`photo image ${photo['key']}`"
        @click="goToPhotoDetail"
      />
      <div v-if="isAdminUser" class="absolute-top flex justify-between photo-top-button-container">
        <q-checkbox
          v-model="selectedPhotosList"
          data-test-id="select-photo-checkbox"
          :val="photo['key']"
          checked-icon="mdi-check-circle"
          color="positive"
          unchecked-icon="mdi-check-circle"
        >
          <q-tooltip> Select photo</q-tooltip>
        </q-checkbox>
        <EditPhotoButton
          data-test-id="edit-photo-button"
          :photo-key="photo['key']"
          color="white"
          @refresh-photo-list="$emit('refreshPhotoList')"
        />
      </div>
    </div>
  </div>
  <template v-else>
    <div class="col-xl-3 col-lg-3 col-md-4 col-sm-6 col-xs-12 q-pa-xs">
      <q-card :flat="!isPhotoSelected" bordered data-test-id="detail-photo-item">
        <q-item class="q-px-sm" clickable>
          <q-item-section avatar @click="goToPhotoDetail()">
            <q-avatar :size="`${thumbnailSize}px`" rounded class="cursor-pointer">
              <q-img
                :ratio="1"
                :src="`${photo['url']}?tr=w-${thumbnailSize},h-${thumbnailSize}`"
                class="rounded-borders"
              />
            </q-avatar>
          </q-item-section>

          <q-item-section @click="goToPhotoDetail()">
            <q-item-label class="text-subtitle2" lines="1">{{ photoId }}</q-item-label>
            <q-item-label caption>{{ lastModified }} </q-item-label>
            <q-item-label caption>{{ fileSize }} </q-item-label>
          </q-item-section>

          <q-item-section v-if="isAdminUser" side>
            <EditPhotoButton
              data-test-id="edit-photo-button"
              :photo-key="photo['key']"
              @refresh-photo-list="$emit('refreshPhotoList')"
            />
          </q-item-section>
        </q-item>
      </q-card>
    </div>
  </template>
</template>

<script lang="ts" setup>
import EditPhotoButton from 'components/button/EditPhotoButton.vue';
import { useQuasar } from 'quasar';
import SelectedItemsComposable from 'src/composables/selected-items-composaable';
import { userStore } from 'stores/user-store';
import { computed, onMounted, ref, toRefs } from 'vue';
import { useRoute, useRouter } from 'vue-router';

defineEmits(['refreshPhotoList']);
const props = defineProps({
  photoStyle: {
    type: String,
    required: true,
  },
  photo: {
    type: Object,
    required: true,
    default: () => ({ key: '', url: '' }),
  },
});

const { photo } = toRefs(props);
const imageWidth = ref(document.getElementById(`photo-image-${photo.value['key']}`)?.clientWidth ?? 0);

const q = useQuasar();
const route = useRoute();
const router = useRouter();
const userPermissionStore = userStore();
const { selectedPhotosList } = SelectedItemsComposable();

const isAdminUser = computed(() => userPermissionStore.isAdminUser);
const photoId = computed(() => photo.value['key'].split('/')[1]);
const thumbnailSize = computed(() => (q.screen.lt.sm ? 80 : 100));
const lastModified = computed(() => new Date(photo.value['lastModified']).toLocaleString());
const fileSize = computed(() => {
  const size = photo.value['size'] / 1024;
  return size < 1024 ? `${size.toFixed(2)} KB` : `${(size / 1024).toFixed(2)} MB`;
});
const isPhotoSelected = computed(() => selectedPhotosList.value.includes(photo.value['key']));

const goToPhotoDetail = async () => await router.replace({ query: { ...route.query, photo: photoId.value } });

onMounted(() => {
  imageWidth.value = document.getElementById(`photo-image-${photo.value['key']}`)?.clientWidth ?? 250;
});
</script>
<style lang="scss">
.photo-item {
  .photo-top-button-container {
    &:hover {
      cursor: pointer;
      background: rgba(0, 0, 0, 0.2);
      opacity: 1;
      transition: all 0.5s;
      -webkit-transition: all 0.5s;
      -moz-transition: all 0.5s;
      border-radius: 8px 8px 0 0;
    }
  }

  .q-checkbox,
  .q-checkbox__inner--falsy {
    color: white !important;
  }
}
.photo-selected {
  box-shadow:
    0 1px 5px rgba(0, 0, 0, 0.2),
    0 2px 2px rgba(0, 0, 0, 0.14),
    0 3px 1px -2px rgba(0, 0, 0, 0.12);
  border-radius: 8px;
}
</style>
