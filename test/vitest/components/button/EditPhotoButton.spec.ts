import { createTestingPinia } from '@pinia/testing';
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { Notify } from 'quasar';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import EditPhotoButton from '../../../../src/components/button/EditPhotoButton.vue';
import { albumStore } from '../../../../src/stores/album-store';
import { mockAlbum } from '../../mock-data';

installQuasarPlugin({ plugins: { Notify } });

vi.mock('../../../../src/services/album-service', () => ({
  default: vi.fn().mockImplementation(() => ({
    updateAlbum: () =>
      Promise.resolve({
        code: 200,
        status: 'Success',
        message: 'ok',
      }),
  })),
}));

describe('EditPhotoButton.vue', () => {
  let wrapper: any;

  beforeEach(async () => {
    wrapper = mount(EditPhotoButton, {
      props: {
        photoKey: 'thisIsAlbumCover/photo1.jpg',
      },
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              albums: {
                selectedAlbumItem: mockAlbum,
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

  it('Check button item', async () => {
    const { vm } = wrapper as any;
    await vm.$nextTick();
    const store = albumStore();
    await wrapper.findComponent('[data-test-id="edit-photo-button"]').trigger('click');
    await vm.$nextTick();
    await wrapper.findComponent('[data-test-id="make-album-cover-button"]').trigger('click');
    await vm.$nextTick();

    expect(vm.isAlbumCover).toBe(false);
    expect(store.updateAlbumCover).toHaveBeenCalledWith({
      id: 'sport',
      albumName: 'Sport',
      description: 'Sport desc',
      tags: ['sport'],
      isPrivate: false,
      albumCover: 'thisIsAlbumCover/photo1.jpg',
      year: '2024',
      order: 0,
    });
  });
});
