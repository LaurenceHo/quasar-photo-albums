<template>
  <q-layout view="hHh lpR fFf">
    <q-header>
      <div class="q-pa-sm">
        <q-toolbar>
          <q-toolbar-title>
            <q-avatar>
              <img src="icons/favicon-128x128.png" />
            </q-avatar>
            Admin
          </q-toolbar-title>
          <q-space />
          <div class="text-h6">Hello! {{ userPermission.displayName }}</div>
        </q-toolbar>
      </div>
    </q-header>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { UserPermission, userStore } from 'src/store/user-store';

const userPermissionStore = userStore();
const userPermission: UserPermission = userPermissionStore.userPermission;
</script>
