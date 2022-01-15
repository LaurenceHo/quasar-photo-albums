import { describe, expect, it } from '@jest/globals';
import { createTestingPinia } from '@pinia/testing';
import { installQuasarPlugin, qLayoutInjections } from '@quasar/quasar-app-extension-testing-unit-jest';
import { flushPromises, mount } from '@vue/test-utils';
import { mockAlbumList, mockRouter as router } from 'app/test/jest/__tests__/mock-data';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import AlbumList from 'pages/AlbumList';
import { QBtn } from 'quasar';

installQuasarPlugin();

describe('AlbumList.vue', () => {
  it('Check album list', async () => {
    const wrapper = mount(AlbumList, {
      global: {
        plugins: [
          router,
          createTestingPinia({
            initialState: {
              album: {
                allAlbumList: mockAlbumList,
                albumTags: ['sport', 'food', 'hiking', 'secret'],
              },
            },
          }),
        ],
        provide: qLayoutInjections(),
        stubs: ['Album'],
      },
    });
    await router.isReady();
    await flushPromises();

    const { vm } = wrapper as any;
    expect(vm.totalItems).toEqual(5);
    expect(vm.chunkAlbumList).toHaveLength(5);
    expect(vm.totalPages).toEqual(1);
    expect(vm.albumStyle).toEqual('list');

    await wrapper.findAllComponents(QBtn)[1].trigger('click');
    await vm.$nextTick();
    await router.isReady();
    await flushPromises();
    expect(vm.albumStyle).toEqual('grid');
  });
});
