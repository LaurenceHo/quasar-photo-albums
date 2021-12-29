<template>
  <q-page>
    <div class="container">
      <div class="center-screen">
        <q-card flat bordered class="rounded-borders-lg" style="width: 300px">
          <q-card-section>
            <div class="text-h4 text-center q-pb-md">Login</div>
            <q-btn
              :loading="loading"
              class="bg-grey-3 full-width full-height"
              no-caps
              unelevated
              @click="handleClickSignIn"
            >
              <img class="absolute" src="/icons/google-icon.svg" style="left: 20px" />
              Sign In With Google
            </q-btn>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import AuthService from 'src/services/auth-service';
import { ref } from 'vue';
import { getAuth, signInWithPopup, GoogleAuthProvider, setPersistence, browserSessionPersistence } from 'firebase/auth';
import { useRouter } from 'vue-router';

const router = useRouter();
const q = useQuasar();
const loading = ref(false);
const authService = new AuthService();

const handleClickSignIn = async () => {
  const provider = new GoogleAuthProvider();
  const auth = getAuth();

  try {
    loading.value = true;
    await setPersistence(auth, browserSessionPersistence);
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential) {
      if (auth) {
        auth.currentUser?.getIdToken().then(async (idToken) => {
          const userInfo = await authService.verifyIdToken(idToken);
          if (userInfo) {
            const token = credential.accessToken;
            localStorage.setItem('authToken', String(token));
            localStorage.setItem('userInfo', JSON.stringify(userInfo));

            q.notify({
              color: 'positive',
              icon: 'mdi-alert-circle-outline',
              message: `Welcome, ${userInfo.displayName}`,
              timeout: 2000,
            });
            setTimeout(() => router.push('/management'), 1000);
          }
        });
      }
    } else {
      q.notify({
        color: 'negative',
        icon: 'mdi-alert-circle-outline',
        message: 'Error!',
      });
    }
  } catch (error: any) {
    const errorMessage = error.message;
    q.notify({
      color: 'negative',
      icon: 'mdi-alert-circle-outline',
      message: `Error! ${errorMessage}`,
    });
  } finally {
    loading.value = false;
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
