<template>
  <q-layout view="lHh Lpr lFf">
    <q-header>
      <q-toolbar>
        <q-avatar>
          <img src="icons/favicon-128x128.png" />
        </q-avatar>
        <q-toolbar-title> {{ albumAppName }} </q-toolbar-title>
        <q-input v-if="routeName === 'Albums'" v-model="searchKey" dense outlined color="secondary">
          <template v-slot:append>
            <q-icon name="mdi-magnify" />
          </template>
        </q-input>
      </q-toolbar>
    </q-header>
    <q-page-container>
      <q-linear-progress query color="secondary" v-if="loadingData" />
      <div class="container">
        <div class="q-pa-md">
          <q-breadcrumbs>
            <q-breadcrumbs-el
              v-for="breadcrumb in breadcrumbs"
              :key="breadcrumb.label"
              :label="breadcrumb.label"
              :icon="breadcrumb.icon"
              :to="breadcrumb.to"
            />
          </q-breadcrumbs>
          <template v-if="!loadingData">
            <router-view v-slot="{ Component }">
              <keep-alive>
                <component :is="Component" />
              </keep-alive>
            </router-view>
          </template>
        </div>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import PhotoList from 'pages/PhotoList.vue';
import { useStore } from 'src/store';
import { ActionType } from 'src/store/types';
import { defineComponent, computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import AlbumList from 'pages/AlbumList.vue';

export default defineComponent({
  name: 'Home',
  components: { PhotoList, AlbumList },
  setup() {
    const store = useStore();
    const route = useRoute();

    const albumAppName = computed(() => process.env.ALBUM_APP_TITLE);
    const loadingData = computed(() => store.state.loadingData);
    const breadcrumbs = computed((): { label: string; icon: string; to?: any }[] => {
      const routes: { label: string; icon: string; to?: any }[] = [];
      routes.push({ label: 'Home', icon: 'mdi-home' });
      routes.push({ label: 'Albums', icon: 'mdi-apps', to: { name: 'Albums' } });
      if (route.name === 'Photos') {
        routes.push({ label: 'Photos', icon: 'mdi-image' });
      }
      return routes;
    });

    const searchKey = ref('');
    watch(searchKey, (newValue) => {
      if (newValue) {
        store.dispatch(ActionType.inputSearchKey, newValue);
      }
    });

    return {
      searchKey,
      loadingData,
      breadcrumbs,
      albumAppName,
      routeName: computed(() => route.name),
    };
  },
});
</script>
