<template>
  <div v-if="albumStyle === 'grid'" class="col-xl-2 col-lg-2 col-md-3 col-sm-4 col-xs-6">
    <div class="relative-position">
      <q-img
        :ratio="1"
        :src="`${thumbnail[0].url}?tr=w-250,h-250`"
        class="rounded-borders-lg cursor-pointer"
        @click="goToAlbum"
      >
        <q-icon
          v-if="albumItem.private"
          class="absolute"
          color="white"
          name="mdi-lock"
          size="sm"
          style="top: 8px; left: 8px"
        />
      </q-img>
      <EditAlbumButton :album-item="albumItem" :album-style="albumStyle" />
    </div>
    <div class="q-pt-sm text-h6 text-weight-medium">{{ albumItem.albumName }}</div>
  </div>
  <template v-else>
    <q-item clickable>
      <q-item-section avatar @click="goToAlbum">
        <q-avatar rounded size="90px">
          <q-img v-if="thumbnail.length" :ratio="1" :src="`${thumbnail[0].url}?tr=w-90,h-90`" class="rounded-borders">
            <q-icon
              v-if="albumItem.private"
              class="absolute"
              color="white"
              name="mdi-lock"
              size="xs"
              style="top: 8px; left: 8px"
            />
          </q-img>
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

      <q-item-section v-if="userPermission.role === 'admin'" side>
        <EditAlbumButton :album-item="albumItem" :album-style="albumStyle" />
      </q-item-section>
    </q-item>
  </template>
</template>

<script lang="ts" setup>
import EditAlbumButton from 'components/EditAlbumButton.vue';
import { Photo } from 'components/models';
import S3Service from 'src/services/s3-service';
import { UserPermission, userStore } from 'src/store/user-store';
import { computed, defineProps, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  albumStyle: {
    type: String,
    required: true,
  },
  albumItem: {
    type: Object,
    required: true,
    default: () => ({ albumName: '', desc: '', tags: [], private: false }),
  },
});

const userPermissionStore = userStore();
const s3Service = new S3Service();
const router = useRouter();
const thumbnail = ref([] as Photo[]);
thumbnail.value.push({ url: '' });

const userPermission = computed(() => userPermissionStore.userPermission as UserPermission);

// Get first photo of album as album cover
onMounted(async () => (thumbnail.value = await s3Service.getPhotoObject(props.albumItem.id, 1)));

const goToAlbum = () => router.push(`/album/${props.albumItem.id}`);
</script>
