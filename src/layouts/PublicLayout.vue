<template>
  <q-layout view="hHh lpR fFf">
    <q-header>
      <div class="q-pa-sm">
        <q-toolbar class="justify-between">
          <q-btn class="text-h6" :ripple="false" no-caps unelevated to="/">
            <q-avatar class="q-mr-sm">
              <img src="/icons/favicon-128x128.png" />
            </q-avatar>
            {{ $q.screen.gt.xs === true ? albumAppName : '' }}
          </q-btn>
          <div class="flex no-wrap">
            <q-btn-toggle
              v-if="routeName !== 'Login'"
              v-model="buttonToggle"
              no-caps
              flat
              stretch
              toggle-color="accent"
              :options="[
                { slot: 'photos', value: 'photos', to: '/' },
                { slot: 'map', value: 'map', to: '/map' },
              ]"
            >
              <template v-slot:photos>
                <div class="row items-center no-wrap">
                  <div v-if="$q.screen.gt.xs" class="q-mr-sm text-subtitle2">Photos</div>
                  <q-icon name="mdi-image-multiple" />
                </div>
              </template>

              <template v-slot:map>
                <div class="row items-center no-wrap">
                  <div v-if="$q.screen.gt.xs" class="q-mr-sm text-subtitle2">Map</div>
                  <q-icon name="mdi-map" />
                </div>
              </template>
            </q-btn-toggle>
            <q-input
              v-if="routeName === 'Albums' || routeName === 'Map'"
              v-model="searchKey"
              dense
              outlined
              color="accent"
            >
              <template v-slot:prepend>
                <q-icon name="mdi-magnify" />
              </template>
              <template v-slot:append>
                <q-icon class="cursor-pointer" name="mdi-close" @click="searchKey = ''" />
              </template>
            </q-input>
            <q-btn v-if="userPermission.uid" class="q-ml-sm" color="accent" icon="mdi-account-circle" round unelevated>
              <q-menu>
                <q-list style="min-width: 100px">
                  <q-item v-if="isAdminUser" v-close-popup clickable @click="setUpdateAlbumDialogState(true)">
                    <q-item-section avatar>
                      <q-icon color="primary" name="mdi-folder-plus" />
                    </q-item-section>
                    <q-item-section>New album</q-item-section>
                  </q-item>
                  <q-item v-if="isAdminUser" v-close-popup clickable @click="setUpdateAlbumTagsDialogState(true)">
                    <q-item-section avatar>
                      <q-icon color="primary" name="mdi-tag-multiple" />
                    </q-item-section>
                    <q-item-section>Manage album tags</q-item-section>
                  </q-item>
                  <q-item v-close-popup clickable @click="logout">
                    <q-item-section avatar>
                      <q-icon color="primary" name="mdi-logout-variant" />
                    </q-item-section>
                    <q-item-section>Logout</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </div>
        </q-toolbar>
      </div>
    </q-header>

    <q-page-container>
      <template v-if="!isCheckingUserPermission && !loadingAlbums">
        <router-view />
      </template>
    </q-page-container>
  </q-layout>
  <EditOrCreateAlbumDialog />
  <EditAlbumTagsDialog />
</template>

<script lang="ts" setup>
import EditAlbumTagsDialog from 'components/dialog/EditAlbumTagsDialog.vue';
import EditOrCreateAlbumDialog from 'components/dialog/EditOrCreateAlbumDialog.vue';
import { UserPermission } from 'components/models';
import { LocalStorage } from 'quasar';
import DialogStateComposable from 'src/composables/dialog-state-composable';
import AuthService from 'src/services/auth-service';
import { albumStore } from 'src/stores/album-store';
import { userStore } from 'src/stores/user-store';
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const authService = new AuthService();
const userPermissionStore = userStore();
const store = albumStore();
const route = useRoute();
const { setUpdateAlbumDialogState, setUpdateAlbumTagsDialogState } = DialogStateComposable();

const searchKey = ref('');
const routeName = computed(() => route.name);
const albumAppName = computed(() => process.env.ALBUM_APP_TITLE);
const userPermission = computed(() => userPermissionStore.userPermission as UserPermission);
const isAdminUser = computed(() => userPermissionStore.isAdminUser);
const isCheckingUserPermission = computed(() => userPermissionStore.isCheckingUserPermission);
const loadingAlbums = computed(() => store.loadingAlbums);
const buttonToggle = ref(
  routeName.value === 'Albums' || routeName.value === 'Photos' ? 'photos' : routeName.value === 'Map' ? 'map' : ''
);

store.getAlbums();
store.getAlbumTags();

const logout = () => {
  authService.logout().then(() => {
    LocalStorage.clear();
    location.reload();
  });
};

watch(searchKey, (newValue) => {
  store.$patch({ searchKey: newValue });
});
</script>
