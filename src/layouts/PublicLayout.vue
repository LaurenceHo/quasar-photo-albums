<template>
  <q-layout view="hHh lpR fFf">
    <q-header>
      <q-toolbar>
        <q-avatar>
          <img src="icons/favicon-128x128.png" />
        </q-avatar>
        <q-toolbar-title> {{ albumAppName }}</q-toolbar-title>
        <q-input v-if="routeName === 'Albums'" v-model="searchKey" dense standout="bg-grey">
          <template v-slot:prepend>
            <q-icon name="mdi-magnify" />
          </template>
          <template v-slot:append>
            <q-icon class="cursor-pointer" name="mdi-close" @click="searchKey = ''" />
          </template>
        </q-input>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts" setup>
import { albumStore } from 'src/store/album-store';
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const store = albumStore();
const route = useRoute();

const searchKey = ref('');

const routeName = computed(() => route.name);
const albumAppName = computed(() => process.env.ALBUM_APP_TITLE);

watch(searchKey, (newValue) => {
  store.setSearchKey(newValue);
});
</script>
