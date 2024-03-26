import { createTestingPinia } from '@pinia/testing';
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { LoadingBar, Notify, QDialog } from 'quasar';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useRoute } from 'vue-router';
import PhotoDetailDialog from '../../../../../src/components/dialog/PhotoDetailDialog.vue';
import { photoStore } from '../../../../../src/stores/photo-store';
import { userStore } from '../../../../../src/stores/user-store';
import { mockPhotoList } from '../../mock-data';

installQuasarPlugin({ components: { QDialog }, plugins: { LoadingBar, Notify } });

const mockReplace = vi.fn();
vi.mock('vue-router', () => ({
  useRoute: vi.fn().mockImplementation(() => {
    return {
      params: {
        albumId: 'album-1',
      },
      query: {
        photo: 'photo2.jpg',
      },
    };
  }),
  useRouter: vi.fn(() => ({
    push: () => {},
    replace: mockReplace,
  })),
}));

describe('PhotoDetailDialog.vue', () => {
  let wrapper: any;

  beforeEach(() => {
    wrapper = mount(PhotoDetailDialog, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              albums: {
                selectedAlbumItem: {
                  id: 'album-1',
                  albumName: 'test album 1',
                  albumCover: 'album1/cover.jpg',
                  description: '',
                  tags: [],
                  isPrivate: false,
                },
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
    expect(mockReplace).toHaveBeenCalledWith({ query: { photo: 'photo3.jpg' } });
    expect(vm.photoFileName).toEqual('photo3.jpg');

    // Click next button again
    wrapper.findComponent('[data-test-id="next-photo-button"]').trigger('click');
    await vm.$nextTick();
    expect(vm.selectedImageIndex).toBe(3);
    expect(mockReplace).toHaveBeenCalledWith({ query: { photo: 'cover.jpg' } });
  });

  it('should fetch photos when photo list is empty', async () => {
    wrapper = mount(PhotoDetailDialog, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              photos: {
                photoList: [],
              },
            },
          }),
        ],
      },
    });

    const { vm } = wrapper as any;
    await vm.$nextTick();
    const usePhotoStore = photoStore();
    expect(usePhotoStore.getPhotos).toHaveBeenCalledWith('album-1');
  });
});
