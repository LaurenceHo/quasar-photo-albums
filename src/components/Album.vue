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
      <q-btn
        v-if="userPermission.role === 'admin'"
        class="absolute"
        color="white"
        flat
        icon="mdi-dots-vertical"
        round
        style="top: 0px; right: 0px"
      >
        <q-menu>
          <q-list style="min-width: 100px">
            <q-item v-close-popup clickable @click="updateAlbum">
              <q-item-section avatar>
                <q-icon color="primary" name="mdi-pencil" />
              </q-item-section>
              <q-item-section>Update album</q-item-section>
            </q-item>
            <q-item v-close-popup clickable @click="deleteAlbum">
              <q-item-section avatar>
                <q-icon color="primary" name="mdi-delete" />
              </q-item-section>
              <q-item-section>Delete album</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </div>
    <div class="q-pt-sm text-h6 text-weight-medium">{{ albumItem.albumName }}</div>
  </div>
  <template v-else>
    <q-item clickable>
      <q-item-section avatar @click="goToAlbum">
        <q-avatar rounded size="90px">
          <q-img :ratio="1" :src="`${thumbnail[0].url}?tr=w-90,h-90`" class="rounded-borders">
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
        <q-btn color="dark" flat icon="mdi-dots-vertical" round>
          <q-menu>
            <q-list style="min-width: 100px">
              <q-item v-close-popup clickable @click="updateAlbum">
                <q-item-section avatar>
                  <q-icon color="primary" name="mdi-pencil" />
                </q-item-section>
                <q-item-section>Update album</q-item-section>
              </q-item>
              <q-item v-close-popup clickable @click="deleteAlbum">
                <q-item-section avatar>
                  <q-icon color="primary" name="mdi-delete" />
                </q-item-section>
                <q-item-section>Delete album</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-item-section>
    </q-item>
  </template>
</template>

<script lang="ts" setup>
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
    default: () => ({ albumName: '', desc: '', tags: [] }),
  },
});

const userPermissionStore = userStore();
const s3Service = new S3Service();
const router = useRouter();
const thumbnail = ref([] as Photo[]);
thumbnail.value.push({ url: '' });

const userPermission = computed(() => userPermissionStore.userPermission as UserPermission);

// Get first photo of album as album cover
onMounted(async () => (thumbnail.value = await s3Service.getPhotoObject(props.albumItem.albumName, 1)));

const goToAlbum = () => router.push(`/album/${props.albumItem.albumName}`);

const updateAlbum = () => {
  // TODO
};
const deleteAlbum = () => {
  // TODO
};
</script>
