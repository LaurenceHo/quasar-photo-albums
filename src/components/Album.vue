<template>
  <div v-if="albumStyle === 'grid'" class="col-xl-2 col-lg-2 col-md-3 col-sm-4 col-xs-6">
    <div class="relative-position">
      <q-img
        v-if="albumItem?.albumCover"
        :ratio="1"
        :src="`${thumbnail}?tr=w-250,h-250`"
        class="rounded-borders-lg cursor-pointer"
        @click="goToAlbum"
      />
      <div v-else class="no-album-cover-square rounded-borders-lg cursor-pointer" @click="goToAlbum">
        <q-icon class="absolute-center" name="mdi-image" size="48px" />
      </div>
      <q-icon
        v-if="albumItem.private"
        class="absolute"
        color="white"
        name="mdi-lock"
        size="sm"
        style="top: 8px; left: 8px"
      />
      <EditAlbumButton v-if="isAdminUser" :album-item="albumItem" :album-style="albumStyle" />
    </div>
    <div class="q-pt-sm text-h6 text-weight-medium">{{ albumItem.albumName }}</div>
  </div>
  <template v-else>
    <q-item clickable>
      <q-item-section avatar @click="goToAlbum">
        <q-avatar rounded size="90px" :class="{ 'no-album-cover-square': !albumItem.albumCover }">
          <q-img v-if="albumItem?.albumCover" :ratio="1" :src="`${thumbnail}?tr=w-90,h-90`" class="rounded-borders" />
          <q-icon v-else name="mdi-image" />
          <q-icon
            v-if="albumItem.private"
            class="absolute"
            color="white"
            name="mdi-lock"
            size="xs"
            style="top: 8px; left: 8px"
          />
        </q-avatar>
      </q-item-section>

      <q-item-section @click="goToAlbum">
        <q-item-label class="text-h6 text-weight-medium">{{ albumItem.albumName }}</q-item-label>
        <q-item-label v-if="albumItem.desc" class="text-subtitle1 text-grey-7">
          {{ albumItem.desc }}
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
import { userStore } from 'src/stores/user-store';
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const cdnURL = process.env.IMAGEKIT_CDN_URL as string;

const props = defineProps({
  albumStyle: {
    type: String,
    required: true,
  },
  albumItem: {
    type: Object,
    required: true,
    default: () => ({ albumName: '', desc: '', tags: [], private: false, albumCover: '' }),
  },
});

const userPermissionStore = userStore();
const router = useRouter();
const isAdminUser = computed(() => userPermissionStore.isAdminUser);
const thumbnail = computed(() => cdnURL + encodeURI(props.albumItem?.albumCover));

const goToAlbum = () => router.push(`/album/${props.albumItem.id}`);
</script>
