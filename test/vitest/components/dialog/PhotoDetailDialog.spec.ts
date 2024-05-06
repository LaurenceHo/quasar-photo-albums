import { createTestingPinia } from '@pinia/testing';
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { LoadingBar, Notify, QDialog } from 'quasar';
import { beforeEach, describe, expect, it } from 'vitest';
import PhotoDetailDialog from '../../../../src/components/dialog/PhotoDetailDialog.vue';
import { userStore } from '../../../../src/stores/user-store';
import { mockAlbum, mockPhotoList } from '../../mock-data';
import { mockRouter as router } from '../../mock-router';

installQuasarPlugin({ components: { QDialog }, plugins: { LoadingBar, Notify } });

describe('PhotoDetailDialog.vue', () => {
  let wrapper: any;

  beforeEach(async () => {
    wrapper = mount(PhotoDetailDialog, {
      global: {
        plugins: [
          router,
          createTestingPinia({
            initialState: {
              albums: {
                selectedAlbumItem: mockAlbum,
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

    await router.push(`/album/2024/album-1?photo=photo2.jpg`);
    await router.isReady();
  });

  it('should display edit photo button based on user permission', async () => {
    const { vm } = wrapper as any;
    const useUserPermissionStore = userStore();
    useUserPermissionStore.userPermission.role = 'user';
    await vm.$nextTick();
    expect(wrapper.findComponent('[data-test-id="edit-photo-button"]').exists()).toBe(false);

    useUserPermissionStore.userPermission.role = 'admin';
    await vm.$nextTick();
    expect(wrapper.findComponent('[data-test-id="edit-photo-button"]').exists()).toBe(true);
  });

  it('navigation button should work correctly', async () => {
    const { vm } = wrapper as any;
    expect(vm.selectedImageIndex).toBe(1);

    // Click next button
    wrapper.findComponent('[data-test-id="next-photo-button"]').trigger('click');
    await vm.$nextTick();
    expect(vm.selectedImageIndex).toBe(2);
    expect(vm.photoFileName).toEqual('photo3.jpg');

    // Click next button again
    wrapper.findComponent('[data-test-id="next-photo-button"]').trigger('click');
    await vm.$nextTick();
    expect(vm.selectedImageIndex).toBe(3);
    expect(vm.photoFileName).toEqual('cover.jpg');
  });

  it('should have correct selected index id', async () => {
    const { vm } = wrapper as any;
    await router.replace({ query: { photo: 'cover.jpg' } });
    await router.isReady();
    await vm.$nextTick();
    expect(vm.selectedImageIndex).toBe(3);
    expect(vm.selectedImage).toHaveProperty('url', 'https://example.com/sport/cover.jpg');
  });
});
