import { createTestingPinia } from '@pinia/testing';
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { Loading, LoadingBar, Notify } from 'quasar';
import { describe, expect, it, vi } from 'vitest';
import PhotoList from '../../../src/pages/PhotoList.vue';
import { mockAlbumList, mockPhotoList } from '../mock-data';
import { mockRouter as router } from '../mock-router';

installQuasarPlugin({ plugins: { Loading, LoadingBar, Notify } });

vi.mock('../../../src/services/photo-service', () => ({
  default: vi.fn().mockImplementation(() => ({
    getPhotosByAlbumId: () =>
      Promise.resolve({
        data: [
          {
            key: '2020-02-15/batch_2019-08-24 10.32.31.jpg',
          },
          {
            key: '2020-02-15/batch_2019-08-24 10.38.09.jpg',
          },
          {
            key: '2020-02-15/batch_2019-08-24 10.39.21.jpg',
          },
        ],
      }),
  })),
}));
describe('PhotoList.vue', () => {
  it('Check photo list', async () => {
    await router.push('/album/Food');
    await router.isReady();

    const wrapper = mount(PhotoList, {
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
            stubActions: false,
          }),
        ],
      },
    });

    await flushPromises();
    const { vm } = wrapper as any;
    await vm.$nextTick();

    expect(vm.photosInAlbum.length).toEqual(3);
    expect(wrapper.findAll('[data-test-id="photo-item"]').length).toEqual(3);
    expect(wrapper.findAll('[data-test-id="album-tag"]').length).toEqual(2);
    expect(wrapper.find('[data-test-id="album-name"]').text()).toEqual('Food title');
    expect(wrapper.find('[data-test-id="album-desc"]').text()).toEqual('Food desc');
    expect(wrapper.find('[data-test-id="photo-manage-panel"]').exists()).toBe(false);
    expect(wrapper.find('[data-test-id="album-map-button"]').exists()).toBe(false);
    expect(vm.photoStyle).toEqual('grid');

    await wrapper.find('[data-test-id="photo-list-style-button"]').trigger('click');
    await vm.$nextTick();
    await router.isReady();
    expect(vm.photoStyle).toEqual('detail');
  });

  it('Check photo list with manage panel', async () => {
    const mockUpdateAlbumCover = vi.fn();
    await router.push('/album/do-something-secret');
    await router.isReady();

    const wrapper = mount(PhotoList, {
      global: {
        plugins: [
          router,
          createTestingPinia({
            initialState: {
              albums: {
                albums: {
                  albumList: mockAlbumList,
                  albumTags: ['sport', 'food', 'hiking', 'secret'],
                },
                getAlbumById: (id: string) => mockAlbumList.find((album) => album.id === id),
                updateAlbumCover: mockUpdateAlbumCover,
              },
              photos: {
                photoList: mockPhotoList,
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
      },
    });

    const { vm } = wrapper as any;
    await vm.$nextTick();
    expect(vm.photosInAlbum.length).toEqual(4);
    expect(wrapper.findAll('[data-test-id="photo-item"]').length).toEqual(4);
    expect(wrapper.findAll('[data-test-id="album-tag"]').length).toEqual(1);
    expect(wrapper.find('[data-test-id="album-name"]').text()).toEqual('Do something secret (private album)');
    expect(wrapper.find('[data-test-id="album-desc"]').text()).toEqual('Do something secret');
    expect(wrapper.find('[data-test-id="album-map-button"]').exists()).toBe(true);
    expect(wrapper.find('[data-test-id="select-all-photos-button"]').exists()).toBe(true);
    expect(wrapper.find('[data-test-id="unselect-all-photos-button"]').exists()).toBe(false);
    // Select all photos
    await wrapper.find('[data-test-id="select-all-photos-button"]').trigger('click');
    expect(vm.getSelectedPhotoList.length).toEqual(4);
    expect(wrapper.find('[data-test-id="unselect-all-photos-button"]').exists()).toBe(true);
    expect(wrapper.find('[data-test-id="photo-manage-panel"]').text()).toEqual('4 selected');
    // Refresh photo list page
    vm.refreshPhotoList();
    await vm.$nextTick();
    expect(mockUpdateAlbumCover).not.toHaveBeenCalled();
    expect(vm.getSelectedPhotoList.length).toEqual(0);
  });
});
