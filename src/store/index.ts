import { store } from 'quasar/wrappers';
import { createPinia, Pinia } from 'pinia';
import { Ref } from 'vue';

declare module '@quasar/app' {
  interface QSsrContext {
    state: Ref<never> | never;
  }
}

// provide typings for `this.$store`
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $store: Pinia;
  }
}

declare module 'pinia' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  interface Pinia {
    replaceState(state: never): void;
  }
}

export default store(function (/**{ ssrContext }**/) {
  const pinia = createPinia();
  /** For SSR
  if (process.env.SERVER && ssrContext) {
    ssrContext.onRendered(function () {
      // unwrapping the state for serialization
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      ssrContext.state = unref(ssrContext.state);
    });
  }**/
  if (process.env.CLIENT) {
    pinia.replaceState = function (state: never) {
      pinia.state.value = state;
    };
  }
  return pinia;
});
