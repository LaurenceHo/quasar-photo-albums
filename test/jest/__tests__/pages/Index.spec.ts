import { describe, expect, it } from '@jest/globals';
import { createTestingPinia } from '@pinia/testing';
import { installQuasarPlugin, qLayoutInjections } from '@quasar/quasar-app-extension-testing-unit-jest';
import { mount } from '@vue/test-utils';
import { mockRouter as router } from 'app/test/jest/__tests__/mock-data';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Index from 'pages/Index';

installQuasarPlugin();

describe('Index.vue', () => {
  it('Check content', async () => {
    const wrapper = mount(Index, {
      global: {
        plugins: [router, createTestingPinia()],
        provide: qLayoutInjections(),
        stubs: ['router-view'],
      },
    });
    await router.isReady();
    expect(wrapper).toBeTruthy();
  });
});
