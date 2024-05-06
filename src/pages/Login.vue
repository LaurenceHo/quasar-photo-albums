<template>
  <q-page>
    <div class="container">
      <div class="center-screen">
        <q-card bordered flat style="width: 300px">
          <q-card-section v-if="!userPermission.uid">
            <div class="text-h4 text-center q-pb-md">Login</div>
            <div class="relative-position">
              <div id="google-login-button" class="flex justify-center"></div>
              <q-spinner v-if="loading" class="login-loading-spinner" color="primary" size="2.5em" />
              <div v-if="loading" class="login-button-overlap" />
            </div>
          </q-card-section>
          <q-card-section v-else>
            <div class="text-h4 text-center q-pb-md">Welcome</div>
            {{ userPermission.displayName }}
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { LocalStorage, useQuasar } from 'quasar';
import { isEmpty } from 'radash';
import AuthService from 'src/services/auth-service';
import { userStore } from 'src/stores/user-store';
import { computed, onMounted, ref } from 'vue';

onMounted(() => {
  // https://developers.google.com/identity/gsi/web/reference/js-reference
  const handleCredentialResponse = async (response: any) => {
    try {
      loading.value = true;
      const { data: userPermission } = await authService.verifyIdToken(response.credential);

      if (!isEmpty(userPermission) && userPermission !== undefined) {
        userPermissionStore.setUserPermission(userPermission);
        q.notify({
          color: 'positive',
          icon: 'mdi-hand-wave',
          message: `Welcome, ${userPermission.displayName}`,
          timeout: 2000,
        });
        LocalStorage.remove('FILTERED_ALBUMS_BY_YEAR');
        setTimeout(() => window.location.assign('/'), 1000);
      } else {
        q.notify({
          color: 'negative',
          icon: 'mdi-alert-circle',
          message: "You don't have permission.",
        });
      }
    } catch (error: any) {
      const errorMessage = error.message;
      q.notify({
        color: 'negative',
        icon: 'mdi-alert-circle',
        message: `Error! ${errorMessage}`,
      });
    } finally {
      loading.value = false;
    }
  };

  google.accounts.id.initialize({
    client_id: process.env.GOOGLE_CLIENT_ID ?? '',
    callback: handleCredentialResponse,
  });
  google.accounts.id.renderButton(document.getElementById('google-login-button'), {
    theme: 'outline',
    size: 'large',
    width: '240',
  });
});

const q = useQuasar();

const loading = ref(false);
const authService = new AuthService();
const userPermissionStore = userStore();
const userPermission = computed(() => userPermissionStore.userPermission);
</script>
<style lang="scss" scoped>
.center-screen {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  min-height: 90vh;
}

.login-loading-spinner {
  position: absolute;
  top: 0;
  left: 50%;
}

.login-button-overlap {
  position: absolute;
  top: 0;
  right: 0;
  cursor: not-allowed;
  width: 100%;
  height: 100%;
}
</style>
