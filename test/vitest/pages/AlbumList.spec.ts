import { createTestingPinia } from '@pinia/testing';
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { Loading, LoadingBar, Notify } from 'quasar';
import { beforeEach, describe, expect, it } from 'vitest';
import AlbumList from '../../../src/pages/AlbumList.vue';
import SkeletonAlbumList from '../../../src/pages/SkeletonAlbumList.vue';
import { albumStore } from '../../../src/stores/album-store';
import { mockAlbumList } from '../mock-data';
import { mockRouter as router } from '../mock-router';

installQuasarPlugin({ plugins: { Loading, LoadingBar, Notify } });

describe('AlbumList.vue', () => {
  let wrapper: any;

  beforeEach(async () => {
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
              'user-permission': {
                userPermission: {
                  uid: 'test-uid',
                  email: 'test@example.com',
                  role: 'admin',
                  displayName: 'test-user',
                },
              },
            },
          }),
        ],
        stubs: ['Album'],
      },
    });

    await router.push('/albums/2024');
    await router.isReady();
    await flushPromises();
  });

  it('Should display skeleton when loading', async () => {
    expect(wrapper.findComponent(SkeletonAlbumList).exists()).toBe(true);
  });

  it('Check album list', async () => {
    const { vm } = wrapper as any;

    const store = albumStore();
    store.loadingAllAlbumInformation = false;
    await vm.$nextTick();
    expect(wrapper.findComponent(SkeletonAlbumList).exists()).toBe(false);

    expect(vm.totalItems).toEqual(11);
    expect(vm.chunkAlbumList).toHaveLength(11);
    expect(vm.totalPages).toEqual(1);
    expect(vm.albumStyle).toEqual('list');

    await wrapper.findComponent('[data-test-id="album-grid-style-button"]').trigger('click');
    await vm.$nextTick();
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
    expect(wrapper.vm.totalItems).toEqual(11);
  });

  it('Search album list by year when route change', async () => {
    await router.push('/albums/2022');
    await router.isReady();
    await flushPromises();

    const { vm } = wrapper as any;
    const store = albumStore();
    await vm.$nextTick();
    expect(store.getAlbumsByYear).toBeCalledWith('2022');
  });

  it('Search album list by category', async () => {
    const { vm } = wrapper as any;
    vm.selectedTags = ['food'];
    await vm.$nextTick();
    expect(vm.totalItems).toEqual(1);
    expect(vm.chunkAlbumList[0]).toHaveProperty('albumName', 'Food title');
  });

  it('Test sort order', async () => {
    const store = albumStore();
    const { vm } = wrapper as any;
    expect(vm.sortOrder).toEqual('desc');
    await wrapper.findComponent('[data-test-id="album-sort-order-button"]').trigger('click');
    expect(vm.sortOrder).toEqual('asc');
    expect(store.sortByKey).toBeCalledWith('asc');
  });

  it('Filter private albums', async () => {
    const { vm } = wrapper as any;
    await wrapper.findComponent('[data-test-id="album-private-toggle"]').trigger('click');
    await vm.$nextTick();
    expect(vm.totalItems).toEqual(1);
    expect(vm.chunkAlbumList[0]).toHaveProperty('albumName', 'Do something secret');
  });
});
