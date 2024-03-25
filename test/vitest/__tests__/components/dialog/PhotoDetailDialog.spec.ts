import { createTestingPinia } from '@pinia/testing';
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { QDialog } from 'quasar';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PhotoDetailDialog from '../../../../../src/components/dialog/PhotoDetailDialog.vue';
import { userStore } from '../../../../../src/stores/user-store';
import { mockPhotoList } from '../../mock-data';

installQuasarPlugin({ components: { QDialog } });

vi.mock('vue-router', () => ({
  useRoute: vi.fn().mockImplementation(() => {
    return {
      params: {
        albumId: 'album-1',
      },
      query: {
        photo: 'photo1.jpg',
      },
    };
  }),
  useRouter: vi.fn(() => ({
    push: () => {},
    replace: () => {},
  })),
}));

describe('PhotoDetailDialog.vue', () => {
  let wrapper: any;

  beforeEach(() => {
    wrapper = mount(PhotoDetailDialog, {
      props: {
        albumId: 'Sport',
      },
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
});
