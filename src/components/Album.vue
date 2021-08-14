<template>
  <div class="col-xl-2 col-lg-2 col-md-3 col-sm-4 col-xs-6">
    <q-img
      :ratio="1"
      :src="`${thumbnail[0].url}?tr=w-250,h-250`"
      class="rounded-borders album-thumbnail"
      @click="goToAlbum"
    >
      <div class="absolute-bottom text-center">{{ albumName }}</div>
    </q-img>
  </div>
</template>

<script lang="ts">
import { getPhotos } from 'components/helper';
import { Photo } from 'components/models';
import { defineComponent, onMounted, ref, toRefs } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'Album',

  props: {
    albumName: {
      type: String,
      required: true,
    },
  },

  setup(props) {
    const { albumName } = toRefs(props);
    const router = useRouter();
    const thumbnail = ref([] as Photo[]);
    thumbnail.value.push({ url: '' });

    // Get first photo of album as album cover
    onMounted(() => getPhotos(albumName.value, 1, (photos: Photo[]) => (thumbnail.value = photos)));

    return {
      thumbnail,
      goToAlbum: () => router.push(`/album/${albumName.value}`),
    };
  },
});
</script>
