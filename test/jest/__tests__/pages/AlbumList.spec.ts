import { describe, expect, it } from '@jest/globals';
import { installQuasarPlugin, qLayoutInjections } from '@quasar/quasar-app-extension-testing-unit-jest';
import { mount } from '@vue/test-utils';
import { mockRouter as router, mockStore as store } from 'app/test/jest/__tests__/mock-data';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import AlbumList from 'pages/AlbumList';
import { QBtn } from 'quasar';
import { storeKey as key } from 'src/store';

installQuasarPlugin();

describe('AlbumList.vue', () => {
  it('Check album list', async () => {
    const wrapper = mount(AlbumList, {
      global: {
        plugins: [router, [store, key]],
        provide: qLayoutInjections(),
        stubs: ['Album'],
      },
    });
    await router.isReady();
    const { vm } = wrapper as any;
    expect(wrapper).toBeTruthy();
    expect(vm.totalItems).toEqual(5);
    expect(vm.chunkAlbumList).toHaveLength(5);
    expect(vm.totalPages).toEqual(1);
    expect(vm.albumListType).toEqual('list');

    await wrapper.findAllComponents(QBtn)[1].trigger('click');
    expect(vm.albumListType).toEqual('grid');
  });
});
