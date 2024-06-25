import { createTestingPinia } from '@pinia/testing';
import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mockAlbumList, mockAlbumTagList } from '../../mock-data';
import { mockRouter as router } from '../../mock-router';
import EditOrCreateAlbumDialog from '../../../../src/components/dialog/EditOrCreateAlbumDialog.vue';
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { QDialog } from 'quasar';
import { albumStore } from '../../../../src/stores/album-store';
import AlbumService from '../../../../src/services/album-service';
import AlbumTagService from '../../../../src/services/album-tag-service';

installQuasarPlugin({ components: { QDialog } });

const spyCreateTags = vi.spyOn(AlbumTagService.prototype, 'createAlbumTags').mockResolvedValue({ code: 200 });
const spyCreateAlbum = vi.spyOn(AlbumService.prototype, 'createAlbum').mockResolvedValue({ code: 200 });

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

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('check creating album', async () => {
    const useAlbumStore = albumStore();
    const { vm } = wrapper as any;
    await vm.setUpdateAlbumDialogState(true);
    await vm.$nextTick();

    expect(wrapper.find('[data-test-id="dialog-title"]').text()).toEqual('New Album');
    expect(wrapper.find('[data-test-id="submit-button"]').text()).toEqual('Create');
    await wrapper.find('form').trigger('submit.prevent');
    expect(spyCreateAlbum).not.toHaveBeenCalled();
    expect(useAlbumStore.getAlbumsByYear).not.toHaveBeenCalled();

    await wrapper.find('[data-test-id="input-album-id"]').setValue('test-album-id');
    await wrapper.find('[data-test-id="input-album-name"]').setValue('test-album-name');
    await wrapper.find('[data-test-id="input-album-desc"]').setValue('test-album-desc');
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();
    expect(spyCreateAlbum).toHaveBeenCalledWith({
      year: '2024',
      id: 'test-album-id',
      albumCover: '',
      albumName: 'test-album-name',
      description: 'test-album-desc',
      isFeatured: undefined,
      isPrivate: true,
      place: null,
      tags: [],
    });
    expect(useAlbumStore.getAlbumsByYear).toHaveBeenCalledWith(String(new Date().getFullYear()), true);
  });

  it('check creating album with tags', async () => {
    const { vm } = wrapper as any;
    await vm.setUpdateAlbumDialogState(true);
    await vm.$nextTick();

    await wrapper.find('[data-test-id="input-album-id"]').setValue('test-album-id');
    await wrapper.find('[data-test-id="input-album-name"]').setValue('test-album-name');
    vm.selectedAlbumTags = ['aaa', 'bbb'];
    await vm.$nextTick();
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();
    expect(spyCreateTags).toHaveBeenCalledWith([{ tag: 'aaa' }, { tag: 'bbb' }]);
    expect(spyCreateAlbum).toHaveBeenCalledWith({
      year: '2024',
      id: 'test-album-id',
      albumCover: '',
      albumName: 'test-album-name',
      description: '',
      isPrivate: true,
      place: null,
      tags: ['aaa', 'bbb'],
    });
  });
});
