import { createTestingPinia } from '@pinia/testing';
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { Notify, QDialog } from 'quasar';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import EditAlbumButton from '../../../../src/components/button/EditAlbumButton.vue';
import DialogStateComposable from '../../../../src/composables/dialog-state-composable';
import { albumStore } from '../../../../src/stores/album-store';

installQuasarPlugin({ plugins: { Notify }, components: { QDialog } });

const mockSetAlbumToBeUpdated = vi.fn();
vi.mock('../../../../src/composables/selected-items-composaable', () => ({
  default: vi.fn().mockImplementation(() => ({
    setAlbumToBeUpdated: mockSetAlbumToBeUpdated,
  })),
}));

vi.mock('../../../../src/services/album-service', () => ({
  default: vi.fn().mockImplementation(() => ({
    deleteAlbum: () =>
      Promise.resolve({
        code: 200,
        status: 'Success',
        message: 'ok',
      }),
  })),
}));

describe('EditAlbumButton.vue', () => {
  let wrapper: any;

  beforeEach(async () => {
    wrapper = mount(EditAlbumButton, {
      props: {
        albumStyle: 'grid',
        albumItem: {
          id: 'sport',
          albumName: 'Sport album name',
          description: 'Sport desc',
          tags: ['sport'],
          isPrivate: false,
        },
      },
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              albums: {
                selectedYear: '2024',
              },
            },
          }),
        ],
      },
    });
  });

  it('Set album to be updated', async () => {
    const { vm } = wrapper as any;
    await vm.$nextTick();
    const store = albumStore();
    await wrapper.findComponent('[data-test-id="edit-album-button"]').trigger('click');
    await vm.$nextTick();
    await wrapper.findComponent('[data-test-id="set-album-button"]').trigger('click');
    await vm.$nextTick();
    expect(mockSetAlbumToBeUpdated).toBeCalledWith({
      id: 'sport',
      albumName: 'Sport album name',
      description: 'Sport desc',
      tags: ['sport'],
      isPrivate: false,
    });

    const { updateAlbumDialogState } = DialogStateComposable();
    expect(updateAlbumDialogState.value).toBeTruthy();
  });
});
