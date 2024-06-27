import { createTestingPinia } from '@pinia/testing';
import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mockAlbumTagList } from '../../mock-data';
import { mockRouter as router } from '../../mock-router';
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { QDialog } from 'quasar';
import { albumStore } from '../../../../src/stores/album-store';
import AlbumTagService from '../../../../src/services/album-tag-service';
import EditAlbumTagsDialog from '../../../../src/components/dialog/EditAlbumTagsDialog.vue';

installQuasarPlugin({ components: { QDialog } });

const spyCreateTags = vi.spyOn(AlbumTagService.prototype, 'createAlbumTags').mockResolvedValue({ code: 200 });
const spyDeleteTag = vi.spyOn(AlbumTagService.prototype, 'deleteAlbumTag').mockResolvedValue({ code: 200 });

describe('EditAlbumTagsDialog.vue', () => {
  let wrapper: any;

  beforeEach(async () => {
    wrapper = mount(EditAlbumTagsDialog, {
      global: {
        plugins: [
          router,
          createTestingPinia({
            initialState: {
              albums: { albumTags: mockAlbumTagList },
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

    await router.push('/albums/2023');
    await router.isReady();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('check creating album tag', async () => {
    const useAlbumStore = albumStore();
    const { vm } = wrapper as any;
    vm.updateAlbumTagsDialogState = true;
    await vm.$nextTick();

    await wrapper.findComponent('[data-test-id="create-tag-button"]').trigger('click');
    await vm.$nextTick();
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();
    expect(spyCreateTags).not.toHaveBeenCalled();

    await wrapper.find('[data-test-id="input-album-tag"]').setValue('test tag');
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();
    expect(spyCreateTags).toHaveBeenCalledWith([{ tag: 'test tag' }]);
    expect(useAlbumStore.getAlbumsByYear).toHaveBeenCalledWith('2023', true);
  });

  it('check deleting album tag', async () => {
    const useAlbumStore = albumStore();
    const { vm } = wrapper as any;
    vm.updateAlbumTagsDialogState = true;
    await vm.$nextTick();

    await wrapper.find(['[data-test-id="delete-tag-button-0"]']).trigger('click');
    await vm.$nextTick();
    expect(wrapper.findComponent('[data-test-id="delete-tag-dialog"]').exists()).toBe(true);
    await wrapper
      .find('[data-test-id="delete-tag-dialog"]')
      .find('[data-test-id="confirm-delete-tag-button"]')
      .trigger('click');
    await flushPromises();
    expect(spyCreateTags).not.toHaveBeenCalled();
    expect(spyDeleteTag).toHaveBeenCalledWith('sport');
    expect(useAlbumStore.getAlbumsByYear).toHaveBeenCalledWith('2023', true);
  });
});
