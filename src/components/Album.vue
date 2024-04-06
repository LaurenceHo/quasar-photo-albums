<template>
  <div v-if="albumStyle === 'grid'" class="col-xl-2 col-lg-2 col-md-3 col-sm-4 col-xs-6" data-test-id="grid-album-item">
    <div class="relative-position">
      <q-img
        v-if="albumItem?.albumCover"
        :ratio="1"
        :src="`${thumbnail}?tr=w-250,h-250`"
        class="rounded-borders-lg cursor-pointer"
        @click="goToAlbum"
      />
      <div v-else class="no-album-cover-square rounded-borders-lg cursor-pointer" @click="goToAlbum()">
        <q-icon class="absolute-center" name="mdi-image" size="48px" />
      </div>
      <q-icon
        v-if="albumItem.isPrivate"
        class="absolute"
        color="white"
        name="mdi-lock"
        size="sm"
        style="top: 8px; left: 8px"
      />
      <EditAlbumButton v-if="isAdminUser" :album-item="albumItem" :album-style="albumStyle" />
    </div>
    <div class="q-pt-sm text-subtitle2 text-weight-medium">{{ albumItem.albumName }}</div>
  </div>
  <template v-else>
    <q-item clickable data-test-id="list-album-item">
      <q-item-section avatar @click="goToAlbum">
        <q-avatar :class="{ 'no-album-cover-square': !albumItem.albumCover }" :size="`${thumbnailSize}px`" rounded>
          <q-img
            v-if="albumItem?.albumCover"
            :ratio="1"
            :src="`${thumbnail}?tr=w-${thumbnailSize},h-${thumbnailSize}`"
            class="rounded-borders"
          />
          <q-icon v-else name="mdi-image" />
          <q-icon
            v-if="albumItem.isPrivate"
            class="absolute"
            color="white"
            name="mdi-lock"
            size="xs"
            style="top: 8px; left: 8px"
          />
        </q-avatar>
      </q-item-section>

      <q-item-section @click="goToAlbum()">
        <q-item-label class="text-h6 text-weight-medium">{{ albumItem.albumName }}</q-item-label>
        <q-item-label v-if="albumItem.description" class="text-subtitle1 text-grey-7">
          {{ albumItem.description }}
        </q-item-label>
        <div class="flex">
          <q-chip v-for="tag in albumItem.tags" :key="tag" color="secondary" dense square>{{ tag }}</q-chip>
        </div>
      </q-item-section>

      <q-item-section v-if="isAdminUser" side>
        <EditAlbumButton :album-item="albumItem" :album-style="albumStyle" />
      </q-item-section>
    </q-item>
  </template>
</template>

<script lang="ts" setup>
import EditAlbumButton from 'components/button/EditAlbumButton.vue';
import { Album } from 'components/models';
import { useQuasar } from 'quasar';
import { userStore } from 'src/stores/user-store';
import { computed, toRefs } from 'vue';
import { useRouter } from 'vue-router';

const q = useQuasar();
const cdnURL = process.env.IMAGEKIT_CDN_URL as string;

const props = defineProps({
  albumStyle: {
    type: String,
    required: true,
  },
  albumItem: {
    type: Object,
    required: true,
    default: () =>
      ({
        id: '',
        albumCover: '',
        albumName: '',
        description: '',
        tags: [],
        isPrivate: true,
        order: 0,
      }) as Album,
  },
});

const { albumItem } = toRefs(props);
const userPermissionStore = userStore();
const router = useRouter();
const isAdminUser = computed(() => userPermissionStore.isAdminUser);
const thumbnail = computed(() => `${cdnURL}/${encodeURI(albumItem.value?.albumCover)}`);
const thumbnailSize = computed(() => (q.screen.lt.sm ? 60 : 90));

const goToAlbum = () => router.push(`/album/${albumItem.value?.id}`);
</script>
<style lang="scss" scoped>
.no-album-cover-square {
  border: gray dashed 1px;

  &:after {
    content: '';
    display: block;
    padding-bottom: 100%;
  }
}
</style>
