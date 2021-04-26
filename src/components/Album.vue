<template>
  <div class="col-xl-2 col-lg-2 col-md-3 col-sm-4 col-xs-6">
    <q-img :ratio="1" :src="thumbnail[0].url" class="rounded-borders album-thumbnail" @click="goToAlbum">
      <div class="absolute-bottom text-center">{{ albumName }}</div>
    </q-img>
  </div>
</template>

<script lang="ts">
import { getPhotos } from 'components/helper';
import { Photo } from 'components/models';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Album',

  props: {
    albumName: {
      type: String,
      required: true,
    },
  },

  data() {
    const thumbnail: Photo[] = [];
    thumbnail.push({ url: '' });
    return {
      thumbnail,
    };
  },

  mounted() {
    // Get first photo of album as album cover
    getPhotos(this.albumName, 1, (photos: Photo[]) => {
      this.thumbnail = photos;
    });
  },

  methods: {
    goToAlbum() {
      this.$router.push(`/album/${this.albumName}`);
    },
  },
});
</script>
