import { boot } from 'quasar/wrappers';
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $firebaseApp: any;
  }
}

// Initialise Firebase
const firebaseApp = initializeApp({
  apiKey: process.env.GOOGLE_FIREBASE_API_KEY,
  authDomain: process.env.GOOGLE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.GOOGLE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.GOOGLE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.GOOGLE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.GOOGLE_FIREBASE_APP_ID,
});
getAnalytics();

export default boot(({ app }) => {
  app.config.globalProperties.$firebaseApp = firebaseApp;
});

export { firebaseApp };
