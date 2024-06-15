import { createTestingPinia } from '@pinia/testing';
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { QSelect } from 'quasar';
import { beforeEach, describe, expect, it } from 'vitest';
import SelectYear from '../../../src/components/SelectYear.vue';
import { mockRouter as router } from '../mock-router';

installQuasarPlugin({ components: { QSelect } });

describe('SelectYear.vue', () => {
  let wrapper: any;

  beforeEach(async () => {
    wrapper = mount(SelectYear, {
      props: {
        selectedYear: '2023',
      },
      global: {
        plugins: [
          router,
          createTestingPinia({
            initialState: {
              albums: {
                countAlbumsByYear: [
                  {
                    year: '2023',
                    count: 2,
                  },
                  {
                    year: '2022',
                    count: 1,
                  },
                ],
              },
            },
          }),
        ],
      },
    });
  });

  it('should emit event when selecting year', async () => {
    const { vm } = wrapper as any;
    vm.internalSelectedYear = '2022';
    await vm.$nextTick();
    expect(wrapper.emitted().selectYear).toEqual([['2022']]);
  });
});
