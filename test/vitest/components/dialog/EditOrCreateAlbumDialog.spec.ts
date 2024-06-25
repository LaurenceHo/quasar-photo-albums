import { createTestingPinia } from '@pinia/testing';
import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockAlbumList, mockAlbumTagList } from '../../mock-data';
import { mockRouter as router } from '../../mock-router';
import EditOrCreateAlbumDialog from '../../../../src/components/dialog/EditOrCreateAlbumDialog.vue';
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { QDialog } from 'quasar';
import { albumStore } from '../../../../src/stores/album-store';
import AlbumService from '../../../../src/services/album-service';

installQuasarPlugin({ components: { QDialog } });

const spyCreateAlbum = vi.spyOn(AlbumService.prototype, 'createAlbum').mockImplementation(() => Promise.resolve());

describe('EditOrCreateAlbumDialog.vue', () => {
  let wrapper: any;

  beforeEach(async () => {
    wrapper = mount(EditOrCreateAlbumDialog, {
      global: {
        plugins: [
          router,
          createTestingPinia({
            initialState: {
              albums: { albumTags: mockAlbumTagList, albumList: mockAlbumList },
            },
          }),
        ],
        stubs: {
          'q-dialog': {
            template: '<div><slot></slot></div>',
          },
        },
      },
    });

    await router.isReady();
  });

  it('check album dialog component', async () => {
    const useAlbumStore = albumStore();
    const { vm } = wrapper as any;
    await vm.setUpdateAlbumDialogState(true);
    await vm.$nextTick();

    expect(wrapper.find('[data-test-id="dialog-title"]').text()).toEqual('New Album');
    expect(wrapper.find('[data-test-id="submit-button"]').text()).toEqual('Create');
    await wrapper.find('[data-test-id="submit-button"]').trigger('click');
    await vm.$nextTick();
    expect(spyCreateAlbum).not.toHaveBeenCalled();
    expect(useAlbumStore.getAlbumsByYear).not.toHaveBeenCalled();
  });
});
