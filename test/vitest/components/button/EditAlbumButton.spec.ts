import { createTestingPinia } from '@pinia/testing';
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { Notify, QDialog } from 'quasar';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import EditAlbumButton from '../../../../src/components/button/EditAlbumButton.vue';
import DialogStateComposable from '../../../../src/composables/dialog-state-composable';
import { mockRouter as router } from '../../mock-router';
import AlbumService from '../../../../src/services/album-service';

installQuasarPlugin({ plugins: { Notify }, components: { QDialog } });

const mockSetAlbumToBeUpdated = vi.fn();
vi.mock('../../../../src/composables/selected-items-composaable', () => ({
  default: vi.fn().mockImplementation(() => ({
    setAlbumToBeUpdated: mockSetAlbumToBeUpdated,
  })),
}));

const spyDeleteAlbum = vi.spyOn(AlbumService.prototype, 'deleteAlbum').mockResolvedValue({ code: 200 });

describe('EditAlbumButton.vue', () => {
  let wrapper: any;

  beforeEach(async () => {
    wrapper = mount(EditAlbumButton, {
      props: {
        albumStyle: 'grid',
        albumItem: {
          year: '2022',
          id: 'sport',
          albumName: 'Sport album name',
          description: 'Sport desc',
          tags: ['sport'],
          isPrivate: false,
        },
      },
      global: {
        plugins: [router, createTestingPinia({})],
        stubs: {
          'q-dialog': {
            template: '<div><slot></slot></div>',
          },
        },
      },
    });

    await router.push('/albums/2022');
    await router.isReady();
  });

  it('Set album to be updated', async () => {
    const { vm } = wrapper as any;
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
      year: '2022',
    });

    const { updateAlbumDialogState } = DialogStateComposable();
    expect(updateAlbumDialogState.value).toBeTruthy();
  });

  it('Delete album', async () => {
    const { vm } = wrapper as any;
    vm.deleteAlbum = true;
    await vm.$nextTick();
    expect(wrapper.find('[data-test-id="confirm-delete-album-dialog"]').exists()).toBeTruthy();
    expect(wrapper.find('[data-test-id="confirm-delete-album-dialog-title"]').text()).toEqual(
      'Do you want to delete album "Sport album name"?'
    );
    await wrapper.findComponent('[data-test-id="confirm-delete-album-button"]').trigger('click');
    await vm.$nextTick();
    await flushPromises();
    expect(spyDeleteAlbum).toBeCalledWith('sport', '2022');
  });
});
