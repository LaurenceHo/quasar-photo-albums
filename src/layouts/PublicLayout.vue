<template>
  <q-layout view="hHh lpR fFf">
    <q-header>
      <div class="q-pa-sm">
        <q-toolbar>
          <q-avatar>
            <img src="/icons/favicon-128x128.png" />
          </q-avatar>
          <q-toolbar-title v-if="$q.screen.gt.xs"> {{ albumAppName }}</q-toolbar-title>
          <q-input v-if="routeName === 'Albums'" v-model="searchKey" dense standout="bg-grey">
            <template v-slot:prepend>
              <q-icon name="mdi-magnify" />
            </template>
            <template v-slot:append>
              <q-icon class="cursor-pointer" name="mdi-close" @click="searchKey = ''" />
            </template>
          </q-input>
          <q-btn v-if="userPermission.uid" class="q-ml-sm" color="secondary" icon="mdi-account-circle" round unelevated>
            <q-menu>
              <q-list style="min-width: 100px">
                <q-item v-close-popup clickable @click="setUpdateAlbumDialogState(true)">
                  <q-item-section avatar>
                    <q-icon color="primary" name="mdi-folder-plus" />
                  </q-item-section>
                  <q-item-section>New album</q-item-section>
                </q-item>
                <q-item v-close-popup clickable @click="setUpdateAlbumTagsDialogState(true)">
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
        </q-toolbar>
      </div>
    </q-header>

    <q-page-container>
      <template v-if="!isCheckingUserPermission">
        <router-view />
      </template>
    </q-page-container>
  </q-layout>
  <EditOrCreateAlbumDialog />
  <EditAlbumTagsDialog />
</template>

<script lang="ts" setup>
import EditAlbumTagsDialog from 'components/EditAlbumTagsDialog.vue';
import EditOrCreateAlbumDialog from 'src/components/EditOrCreateAlbumDialog.vue';
import DialogStateComposable from 'src/composables/dialog-state-composable';
import AuthService from 'src/services/auth-service';
import { albumStore } from 'src/stores/album-store';
import { UserPermission, userStore } from 'src/stores/user-store';
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
const isCheckingUserPermission = computed(() => userPermissionStore.isCheckingUserPermission);

userPermissionStore.checkUserPermission();

const logout = () => {
  authService.logout().then(() => location.reload());
};

watch(searchKey, (newValue) => {
  store.setSearchKey(newValue);
});
</script>
