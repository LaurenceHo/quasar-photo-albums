<template>
  <div v-if="albumType === 'square'" class="col-xl-2 col-lg-2 col-md-3 col-sm-4 col-xs-6">
    <q-img
      :ratio="1"
      :src="`${thumbnail[0].url}?tr=w-250,h-250`"
      class="rounded-borders album-thumbnail"
      @click="goToAlbum"
    >
      <div class="absolute-bottom text-center">{{ albumItem.albumName }}</div>
    </q-img>
  </div>
  <template v-else>
    <q-item clickable v-ripple @click="goToAlbum">
      <q-item-section avatar>
        <q-avatar rounded size="72px">
          <q-img class="rounded-borders" :ratio="1" :src="`${thumbnail[0].url}?tr=w-72,h-72`" />
        </q-avatar>
      </q-item-section>

      <q-item-section>
        <q-item-label class="text-weight-medium">{{ albumItem.albumName }}</q-item-label>
        <q-item-label v-if="albumItem.desc" caption>
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
import { getPhotoObjectFromS3 } from 'components/helper';
import { Photo } from 'components/models';
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
    const router = useRouter();
    const thumbnail = ref([] as Photo[]);
    thumbnail.value.push({ url: '' });

    // Get first photo of album as album cover
    onMounted(async () => (thumbnail.value = await getPhotoObjectFromS3(props.albumItem.albumName, 1)));

    return {
      thumbnail,
      goToAlbum: () => router.push(`/album/${props.albumItem.albumName}`),
    };
  },
});
</script>
