import { createTestingPinia } from '@pinia/testing';
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { Loading, LoadingBar, Notify } from 'quasar';
import { beforeEach, describe, expect, it } from 'vitest';
import AlbumList from '../../../src/pages/AlbumList.vue';
import { albumStore } from '../../../src/stores/album-store';
import { mockAlbumList } from '../mock-data';
import { mockRouter as router } from '../mock-router';

installQuasarPlugin({ plugins: { Loading, LoadingBar, Notify } });

describe('AlbumList.vue', () => {
  let wrapper: any;

  beforeEach(() => {
    wrapper = mount(AlbumList, {
      global: {
        plugins: [
          router,
          createTestingPinia({
            initialState: {
              albums: {
                albumList: mockAlbumList,
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

    await wrapper.findComponent('[data-test-id="album-grid-style-button"]').trigger('click');
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

    store.searchKey = 'Shoes';
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.totalItems).toEqual(1);

    store.searchKey = '';
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.totalItems).toEqual(5);
  });

  it('Search album list by year', async () => {
    const { vm } = wrapper as any;
    const store = albumStore();
    vm.selectedYear = '2024';
    await vm.$nextTick();
    expect(store.getAlbumsByYear).toHaveBeenCalledWith('2024');
  });

  it('Search album list by category', async () => {
    const { vm } = wrapper as any;
    vm.selectedTags = ['food'];
    await vm.$nextTick();
    expect(vm.totalItems).toEqual(1);
    expect(vm.chunkAlbumList[0]).toHaveProperty('albumName', 'Food title');
  });

  it('Test sort order', async () => {
    const { vm } = wrapper as any;
    expect(vm.sortOrder).toEqual('desc');
    expect(vm.chunkAlbumList[0]).toHaveProperty('albumName', 'Sport');
    await wrapper.findComponent('[data-test-id="album-sort-order-button"]').trigger('click');
    expect(vm.sortOrder).toEqual('asc');
    expect(vm.chunkAlbumList[0]).toHaveProperty('albumName', 'Do something secret');
  });

  it('Refresh album list', async () => {
    const { vm } = wrapper as any;
    const store = albumStore();
    store.refreshAlbumList = true;
    await vm.$nextTick();
    expect(store.updateRefreshAlbumListFlag).toHaveBeenCalledOnce();
  });
});
