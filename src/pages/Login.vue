<template>
  <q-page>
    <div class="container">
      <div class="center-screen">
        <q-card flat bordered style="width: 300px">
          <q-card-section>
            <div class="text-h4 text-center q-pb-md">Login</div>
            <q-btn
              :loading="loading"
              class="bg-grey-3 full-width full-height"
              no-caps
              unelevated
              @click="handleClickSignIn"
            >
              <img alt="google icon" class="absolute" src="/icons/google-icon.svg" style="left: 20px" />
              Sign In With Google
            </q-btn>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import isEmpty from 'lodash/isEmpty';
import { LocalStorage, useQuasar } from 'quasar';
import AuthService from 'src/services/auth-service';
import { userStore } from 'src/stores/user-store';
import { ref } from 'vue';

const q = useQuasar();

const loading = ref(false);
const authService = new AuthService();
const userPermissionStore = userStore();

const handleClickSignIn = async () => {
  const provider = new GoogleAuthProvider();
  const auth = getAuth();

  try {
    loading.value = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (auth && credential) {
      auth.currentUser?.getIdToken().then(async (idToken) => {
        const { data: userPermission } = await authService.verifyIdToken(idToken);

        if (!isEmpty(userPermission)) {
          userPermissionStore.setUserPermission(userPermission);
          q.notify({
            color: 'positive',
            icon: 'mdi-hand-wave',
            message: `Welcome, ${userPermission.displayName}`,
            timeout: 2000,
          });
          LocalStorage.remove('ALL_ALBUMS');
          setTimeout(() => window.location.assign('/'), 1000);
        }
        loading.value = false;
      });
    } else {
      q.notify({
        color: 'negative',
        icon: 'mdi-alert-circle',
        message: 'Error!',
      });
    }
  } catch (error: any) {
    loading.value = false;
    const errorMessage = error.message;
    q.notify({
      color: 'negative',
      icon: 'mdi-alert-circle',
      message: `Error! ${errorMessage}`,
    });
  }
};
</script>
<style scoped lang="scss">
.center-screen {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  min-height: 90vh;
}
</style>
