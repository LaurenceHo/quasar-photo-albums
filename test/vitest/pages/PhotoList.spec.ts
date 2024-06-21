import { createTestingPinia } from '@pinia/testing';
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { Loading, LoadingBar, Notify } from 'quasar';
import { describe, expect, it } from 'vitest';
import PhotoDetail from '../../../src/components/PhotoDetail.vue';
import PhotoList from '../../../src/pages/PhotoList.vue';
import { mockAlbumList, mockPhotoList } from '../mock-data';
import { mockRouter as router } from '../mock-router';

installQuasarPlugin({ plugins: { Loading, LoadingBar, Notify } });

describe('PhotoList.vue', () => {
  it('Check photo list', async () => {
    const wrapper = mount(PhotoList, {
      global: {
        plugins: [
          router,
          createTestingPinia({
            initialState: {
              albums: {
                albumList: mockAlbumList,
                albumTags: ['sport', 'food', 'hiking', 'secret'],
                selectedAlbumItem: mockAlbumList[1],
              },
              photos: {
                photoList: [
                  {
                    key: 'food/food1.jpg',
                  },
                  {
                    key: 'food/food9.jpg',
                  },
                  {
                    key: 'food/food21.jpg',
                  },
                ],
              },
            },
          }),
        ],
      },
    });

    await flushPromises();
    const { vm } = wrapper as any;
    await vm.$nextTick();

    expect(wrapper.findComponent(PhotoDetail).exists()).toBeFalsy();
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
    await router.push('/album/2024/do-something-secret');
    await router.isReady();

    const wrapper = mount(PhotoList, {
      global: {
        plugins: [
          router,
          createTestingPinia({
            initialState: {
              albums: {
                selectedAlbumItem: mockAlbumList[4],
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

    expect(wrapper.findComponent(PhotoDetail).exists()).toBeFalsy();
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
    expect(vm.getSelectedPhotoList.length).toEqual(0);
  });

  it('should display photo detail', async () => {
    await router.push('/album/2024/food?photo=photo1.jpg');
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
          }),
        ],
      },
    });

    await flushPromises();
    const { vm } = wrapper as any;
    await vm.$nextTick();
    expect(wrapper.findComponent(PhotoDetail).exists()).toBeTruthy();
  });
});
