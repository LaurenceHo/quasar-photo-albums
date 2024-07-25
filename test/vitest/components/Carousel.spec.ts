import { createTestingPinia } from '@pinia/testing';
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { QIcon } from 'quasar';
import { describe, expect, test, vi } from 'vitest';
import Carousel from '../../../src/components/Carousel.vue';
import { mockAlbumList } from '../mock-data';
import { mockRouter as router } from '../mock-router';

installQuasarPlugin({ components: { QIcon } });
vi.mock('embla-carousel-vue', () => ({
  default: vi.fn().mockImplementation(() => [vi.fn(), vi.fn()]),
}));

describe('Carousel.vue', () => {
  test('Should display carousel', async () => {
    const wrapper = mount(Carousel, {
      global: {
        plugins: [
          router,
          createTestingPinia({
            initialState: {
              albums: {
                featuredAlbums: mockAlbumList,
              },
            },
          }),
        ],
      },
    });

    const { vm } = wrapper as any;
    expect(vm.featuredAlbums.length).toEqual(11);
    expect(wrapper.findAll('[data-test-id="carousel-slide"]').length).toEqual(11);
  });
});
