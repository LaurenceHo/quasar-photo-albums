import { createTestingPinia } from '@pinia/testing';
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QDialog } from 'quasar';
import MovePhotosDialog from '../../../../../src/components/dialog/MovePhotosDialog.vue';
import DialogStateComposable from '../../../../../src/composables/dialog-state-composable';
import { mockAlbumList } from '../../mock-data';

installQuasarPlugin({ components: { QDialog } });

vi.mock('../../../../../src/services/photo-service', () => ({
  default: vi.fn().mockImplementation(() => ({
    getPhotosByAlbumId: () =>
      Promise.resolve({
        data: [
          {
            key: '2020-02-15/batch_2019-08-24 10.32.31.jpg',
          },
          {
            key: '2020-02-15/batch_2019-08-24 10.38.09.jpg',
          },
          {
            key: '2020-02-15/batch_2019-08-24 10.39.21.jpg',
          },
        ],
      }),
    movePhotos: () => Promise.resolve({ status: 'Success' }),
  })),
}));

describe('MovePhotosDialog.vue', () => {
  let wrapper: any;

  beforeEach(() => {
    wrapper = mount(MovePhotosDialog, {
      props: {
        albumId: 'Sport',
      },
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              albums: {
                allAlbumList: mockAlbumList,
              },
            },
          }),
        ],
      },
    });
  });

  it('check album select component', async () => {
    const { vm } = wrapper as any;
    await vm.setMovePhotoDialogState(true);
    await vm.$nextTick();

    expect(vm.selectedAlbum).toEqual('Food');
    expect(wrapper.findComponent('[data-test-id="move-photos-button"]').classes()).toContain('disabled');
  });

  it('check move photos button', async () => {
    const { vm } = wrapper as any;
    await vm.setMovePhotoDialogState(true);
    await vm.$nextTick();

    const { setSelectedPhotosList } = DialogStateComposable();
    setSelectedPhotosList(['album1/1.jpg', 'album1/2.jpg']);
    await vm.$nextTick();
    // Check photo keys array
    expect(vm.photoKeysArray).toEqual(['1.jpg', '2.jpg']);

    // Click upload button
    await wrapper.findComponent('[data-test-id="move-photos-button"]').trigger('click');
    await vm.$nextTick();
    expect(vm.duplicatedPhotoKeys).toEqual([]);
    // Check emit event
    expect(wrapper.emitted().closePhotoDetailDialog).toEqual([[]]);
    expect(wrapper.emitted().refreshPhotoList).toEqual([[]]);
  });

  it('check duplicated file in the destination folder', async () => {
    const { vm } = wrapper as any;
    await vm.setMovePhotoDialogState(true);
    await vm.$nextTick();

    const { setSelectedPhotosList } = DialogStateComposable();
    setSelectedPhotosList([
      '2020-02-15/batch_2019-08-24 10.32.31.jpg',
      '2020-02-15/batch_2019-08-24 10.38.09.jpg',
      '2020-02-15/batch_2019-08-24 10.39.21.jpg',
    ]);
    await vm.$nextTick();
    // Check photo keys array
    expect(vm.photoKeysArray).toEqual([
      'batch_2019-08-24 10.32.31.jpg',
      'batch_2019-08-24 10.38.09.jpg',
      'batch_2019-08-24 10.39.21.jpg',
    ]);

    // Click upload button
    await wrapper.findComponent('[data-test-id="move-photos-button"]').trigger('click');
    await vm.$nextTick();
    expect(vm.duplicatedPhotoKeys).toEqual([
      'batch_2019-08-24 10.32.31.jpg',
      'batch_2019-08-24 10.38.09.jpg',
      'batch_2019-08-24 10.39.21.jpg',
    ]);
    // Check emit event
    expect(wrapper.emitted().closePhotoDetailDialog).toBeUndefined();
    expect(wrapper.emitted().refreshPhotoList).toBeUndefined();
  });
});
