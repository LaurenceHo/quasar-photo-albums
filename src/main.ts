import 'mapbox-gl/dist/mapbox-gl.css';
import './assets/primevue-override.css';
import { definePreset } from '@primevue/themes';
import Aura from '@primevue/themes/aura';
import { VueQueryPlugin } from '@tanstack/vue-query';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import Tooltip from 'primevue/tooltip';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

declare global {
  interface Window {
    dataLayer: any[]; // You can make this more specific if needed (e.g., Array<any>)
    gtag?: (...args: any[]) => void; // Optional gtag function
  }
}

const prepareApp = async () => {
  const { worker } = await import('./mocks/browser');
  return worker.start({
    onUnhandledRequest: (request, print) => {
      const ignoredUrls = [
        'chrome-extension://',
        'https://fonts.gstatic.com',
        'https://api.mapbox.com',
        'https://events.mapbox.com',
      ];

      // Check if the request URL starts with any of the ignored URLs
      if (ignoredUrls.some((url) => request.url.startsWith(url))) {
        return;
      }

      print.warning();
    },
  });
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
      darkModeSelector: '.dark',
      cssLayer: {
        name: 'primevue',
        order: 'theme, base, primevue',
      },
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

const gtagId = import.meta.env.VITE_GTAG_ID;
if (gtagId) {
  console.log('Loading Google Analytics with GTAG_ID:', gtagId);

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gtagId}`;
  
  // Wait for the script to load before initializing
  script.onload = () => {
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', gtagId);
    console.log('Google Analytics initialised');
  };

  script.onerror = () => {
    console.error('Failed to load Google Analytics script');
  };

  document.head.appendChild(script);
} else {
  console.warn('VITE_GTAG_ID is not defined');
}
