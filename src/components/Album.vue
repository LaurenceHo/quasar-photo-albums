<template>
  <div v-if="albumType === 'square'" class="col-xl-2 col-lg-2 col-md-3 col-sm-4 col-xs-6">
    <q-img
      :ratio="1"
      :src="`${thumbnail[0].url}?tr=w-250,h-250`"
      class="rounded-borders-lg cursor-pointer"
      @click="goToAlbum"
    >
    </q-img>
    <div class="q-pt-sm text-h6 text-weight-medium">{{ albumItem.albumName }}</div>
  </div>
  <template v-else>
    <q-item v-ripple clickable @click="goToAlbum">
      <q-item-section avatar>
        <q-avatar rounded size="90px">
          <q-img :ratio="1" :src="`${thumbnail[0].url}?tr=w-90,h-90`" class="rounded-borders" />
        </q-avatar>
      </q-item-section>

      <q-item-section>
        <q-item-label class="text-h6 text-weight-medium">{{ albumItem.albumName }}</q-item-label>
        <q-item-label v-if="albumItem.desc" class="text-subtitle1 text-grey-7">
          {{ albumItem.desc }}
        </q-item-label>
        <div class="flex">
          <q-chip v-for="tag in albumItem.tags" :key="tag" color="secondary" dense square>{{ tag }}</q-chip>
        </div>
      </q-item-section>
    </q-item>
  </template>
</template>

<script lang="ts">
import { Photo } from 'components/models';
import S3Service from 'src/services/s3-service';
import { defineComponent, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'Album',

  props: {
    albumType: {
      type: String,
      required: true,
    },
    albumItem: {
      type: Object,
      required: true,
      default: () => ({ albumName: '', desc: '', tags: [] }),
    },
  },

  setup(props) {
    const s3Service = new S3Service();
    const router = useRouter();
    const thumbnail = ref([] as Photo[]);
    thumbnail.value.push({ url: '' });

    // Get first photo of album as album cover
    onMounted(async () => (thumbnail.value = await s3Service.getPhotoObject(props.albumItem.albumName, 1)));

    return {
      thumbnail,
      goToAlbum: () => router.push(`/album/${props.albumItem.albumName}`),
    };
  },
});
</script>
