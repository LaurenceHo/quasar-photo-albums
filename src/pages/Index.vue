<template>
  <q-page>
    <q-linear-progress v-if="loadingAlbum" color="secondary" query />
    <div class="container">
      <div class="q-pa-md">
        <q-breadcrumbs>
          <q-breadcrumbs-el
            v-for="breadcrumb in breadcrumbs"
            :key="breadcrumb.label"
            :icon="breadcrumb.icon"
            :label="breadcrumb.label"
            :to="breadcrumb.to"
          />
        </q-breadcrumbs>
        <template v-if="!loadingAlbum">
          <router-view v-slot="{ Component }">
            <keep-alive>
              <component :is="Component" />
            </keep-alive>
          </router-view>
        </template>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { useStore } from 'src/store';
import { computed, defineComponent } from 'vue';
import { useRoute } from 'vue-router';

export default defineComponent({
  name: 'Index',

  setup() {
    const store = useStore();
    const route = useRoute();

    const loadingAlbum = computed(() => store.state.loadingAlbum);
    const breadcrumbs = computed((): { label: string; icon: string; to?: any }[] => {
      const routes: { label: string; icon: string; to?: any }[] = [];
      routes.push({ label: 'Home', icon: 'mdi-home' });
      routes.push({ label: 'Albums', icon: 'mdi-apps', to: { name: 'Albums' } });
      if (route.name === 'Photos') {
        routes.push({ label: 'Photos', icon: 'mdi-image' });
      }
      return routes;
    });

    return {
      loadingAlbum,
      breadcrumbs,
    };
  },
});
</script>
