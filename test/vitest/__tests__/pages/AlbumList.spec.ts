import { beforeEach, describe, expect, it } from 'vitest';
import { createTestingPinia } from '@pinia/testing';
import { installQuasar } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { flushPromises, mount } from '@vue/test-utils';
import AlbumList from '../../../../src/pages/AlbumList.vue';
import { Loading, LoadingBar, Notify, QBtn } from 'quasar';
import { albumStore } from '../../../../src/stores/album-store';
import { mockAlbumList } from '../mock-data';
import { mockRouter as router } from '../mock-router';

installQuasar({ plugins: { Loading, LoadingBar, Notify } });

describe('AlbumList.vue', () => {
  let wrapper: any;

  beforeEach(() => {
    wrapper = mount(AlbumList, {
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
        stubs: ['Album'],
      },
    });
  });

  it('Check album list', async () => {
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

  it('Search album list', async () => {
    const store = albumStore();
    store.searchKey = 'Apple';

    await wrapper.vm.$nextTick();
    expect(wrapper.vm.totalItems).toEqual(0);
  });

  it('Search album list by category', async () => {
    const { vm } = wrapper as any;
    vm.selectedTags = ['sport'];
    await vm.$nextTick();
    expect(vm.totalItems).toEqual(1);
    expect(vm.chunkAlbumList[0]).toHaveProperty('albumName', 'Sport');
  });
});
