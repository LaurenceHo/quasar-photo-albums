import { describe, expect, it } from 'vitest';
import { createTestingPinia } from '@pinia/testing';
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import Index from '../../../../src/pages/Index.vue';
import { mockRouter as router } from '../mock-router';

installQuasarPlugin();

describe('Index.vue', () => {
  it('Check content', async () => {
    const wrapper = mount(Index, {
      global: {
        plugins: [router, createTestingPinia()],
        stubs: ['router-view'],
      },
    });
    await router.isReady();
    expect(wrapper).toBeTruthy();
  });
});
