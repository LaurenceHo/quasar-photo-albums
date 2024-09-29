import 'mapbox-gl/dist/mapbox-gl.css';
import './assets/tailwind.css';
import './assets/primevue-override.scss';
import { definePreset } from '@primevue/themes';
import Aura from '@primevue/themes/aura';
import { VueQueryPlugin } from '@tanstack/vue-query';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import Tooltip from 'primevue/tooltip';

const prepareApp = async () => {
  const { worker } = await import('./mocks/browser');
  return worker.start();
};

const app = createApp(App);

const myThemePreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{sky.50}',
      100: '{sky.100}',
      200: '{sky.200}',
      300: '{sky.300}',
      400: '{sky.400}',
      500: '{sky.500}',
      600: '{sky.600}',
      700: '{sky.700}',
      800: '{sky.800}',
      900: '{sky.900}',
      950: '{sky.950}',
    },
  },
});

app.use(PrimeVue, {
  theme: {
    preset: myThemePreset,
    options: {
      darkModeSelector: '.dark-theme',
    },
  },
});
app.use(router);
app.use(VueQueryPlugin);
app.use(ToastService);
app.directive('tooltip', Tooltip);

if (import.meta.env.MODE === 'MSW') {
  prepareApp().then(() => {
    app.mount('#app');
  });
} else {
  app.mount('#app');
}
