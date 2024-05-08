import { createTestingPinia } from '@pinia/testing';
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { QDialog } from 'quasar';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MovePhotosDialog from '../../../../src/components/dialog/MovePhotosDialog.vue';
import SelectedItemsComposable from '../../../../src/composables/selected-items-composaable';
import { mockAlbumList, mockPhotoList } from '../../mock-data';
import { mockRouter as router } from '../../mock-router';

installQuasarPlugin({ components: { QDialog } });

vi.mock('../../../../src/services/photo-service', () => ({
  default: vi.fn().mockImplementation(() => ({
    getPhotosByAlbumId: () =>
      Promise.resolve({
        data: mockPhotoList,
      }),
    movePhotos: () => Promise.resolve({ status: 'Success', code: 200 }),
  })),
}));

vi.mock('../../../../src/services/album-service', () => ({
  default: vi.fn().mockImplementation(() => ({
    getAlbumsByYear: () =>
      Promise.resolve({
        status: 'Success',
        code: 200,
        data: [
          {
            year: '2023',
            id: 'hiking-123',
            albumName: 'Hiking album name',
            description: 'Hiking desc',
            tags: ['hiking'],
            isPrivate: false,
          },
          {
            year: '2023',
            id: 'shoes-123',
            albumName: 'Shoes album name',
            description: 'Shoes desc',
            tags: [],
            isPrivate: false,
          },
        ],
      }),
  })),
}));

describe('MovePhotosDialog.vue', () => {
  let wrapper: any;

  beforeEach(async () => {
    wrapper = mount(MovePhotosDialog, {
      props: {
        albumId: 'sport',
      },
      global: {
        plugins: [
          router,
          createTestingPinia({
            initialState: {
              albums: {
                albumList: mockAlbumList,
              },
            },
          }),
        ],
      },
    });
  });

  it('check album select component', async () => {
    await router.push('/album/2024/album-1');
    await router.isReady();

    const { vm } = wrapper as any;
    await vm.setMovePhotoDialogState(true);
    await vm.$nextTick();

    expect(vm.selectedAlbumModel).toEqual({ label: 'Food title', value: 'food' });
    expect(wrapper.findComponent('[data-test-id="move-photos-button"]').classes()).toContain('disabled');
  });

  it('check move photos button', async () => {
    const { vm } = wrapper as any;
    await vm.setMovePhotoDialogState(true);
    await vm.$nextTick();

    const { setSelectedPhotosList } = SelectedItemsComposable();
    setSelectedPhotosList(['album1/1.jpg', 'album1/2.jpg']);
    await vm.$nextTick();
    // Check photo keys array
    expect(vm.photoKeysArray).toEqual(['1.jpg', '2.jpg']);

    // Click move button
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

    const { setSelectedPhotosList } = SelectedItemsComposable();
    setSelectedPhotosList(['album-1/photo1.jpg', 'album-1/photo2.jpg', 'album-1/photo3.jpg']);
    await vm.$nextTick();
    // Check photo keys array
    expect(vm.photoKeysArray).toEqual(['photo1.jpg', 'photo2.jpg', 'photo3.jpg']);
    expect(vm.duplicatedPhotoKeys).toEqual([]);
    // Click move button
    await wrapper.findComponent('[data-test-id="move-photos-button"]').trigger('click');
    await vm.$nextTick();
    expect(vm.duplicatedPhotoKeys).toEqual(['photo1.jpg', 'photo2.jpg', 'photo3.jpg']);
    // Check emit event
    expect(wrapper.emitted().closePhotoDetailDialog).toBeUndefined();
    expect(wrapper.emitted().refreshPhotoList).toBeUndefined();
  });

  it('select album with year', async () => {
    const { vm } = wrapper as any;
    await vm.setMovePhotoDialogState(true);
    await vm.$nextTick();

    const { setSelectedPhotosList } = SelectedItemsComposable();
    setSelectedPhotosList(['album-1/photo1.jpg', 'album-1/photo2.jpg', 'album-1/photo3.jpg']);
    await vm.$nextTick();
    vm.selectedYear = '2023';
    await vm.$nextTick();
    expect(vm.selectedAlbumModel).toEqual({ label: 'Hiking album name', value: 'hiking-123' });
  });
});
