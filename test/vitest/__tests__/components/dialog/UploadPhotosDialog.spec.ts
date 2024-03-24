import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import { ref } from 'vue';
import UploadPhotosDialog from '../../../../../src/components/dialog/UploadPhotosDialog.vue';
import { QDialog } from 'quasar';

installQuasarPlugin({ components: { QDialog } });

const mockUploadFiles = vi.fn().mockImplementation(() => Promise.resolve());
vi.mock('../../../../../src/composables/file-uploader-composable', () => ({
  default: vi.fn().mockImplementation(() => ({
    isUploading: ref(false),
    isCompleteUploading: ref(false),
    setIsCompleteUploading: vi.fn(),
    createUploader: () => ({
      uploadFile: () => Promise.resolve(),
      uploadFiles: mockUploadFiles,
    }),
  })),
}));

describe('UploadPhotosDialog.vue', () => {
  const mockFiles = [
    {
      file: {
        id: 'image',
        name: 'a',
      },
    },
    {
      file: {
        id: 'image',
        name: 'b',
      },
    },
    {
      file: {
        id: 'image',
        name: 'c',
      },
    },
  ];
  it('check if upload button is disabled when no file', async () => {
    const wrapper = mount(UploadPhotosDialog, {
      props: {
        albumId: 'testId',
      },
      global: {
        stubs: {
          FilePreview: {
            template: '<div></div>',
          },
        },
      },
    });

    const { vm } = wrapper as any;
    await vm.setUploadPhotoDialogState(true);
    await vm.$nextTick();

    vm.files = mockFiles;
    await vm.$nextTick();

    expect(vm.files.length).toEqual(3);
    expect(wrapper.findComponent('[data-test-id="upload-file-button"]').classes()).not.toContain('disabled');
    expect(wrapper.findComponent('[data-test-id="clear-file-button"]').classes()).not.toContain('disabled');

    await wrapper.setProps({ albumId: 'testId2' });
    // When album id change, clear files
    expect(vm.files.length).toEqual(0);
    expect(wrapper.findComponent('[data-test-id="upload-file-button"]').classes()).toContain('disabled');
    expect(wrapper.findComponent('[data-test-id="clear-file-button"]').classes()).toContain('disabled');
  });

  it('check upload button', async () => {
    const wrapper = mount(UploadPhotosDialog, {
      props: {
        albumId: 'testId',
      },
      global: {
        stubs: {
          FilePreview: {
            template: '<div></div>',
          },
        },
      },
    });

    const { vm } = wrapper as any;
    await vm.setUploadPhotoDialogState(true);
    await vm.$nextTick();

    vm.files = mockFiles;
    await vm.$nextTick();

    // Click upload button
    await wrapper.findComponent('[data-test-id="upload-file-button"]').trigger('click');
    await vm.$nextTick();
    expect(mockUploadFiles).toHaveBeenCalledOnce();
    vm.isCompleteUploading = true;
    await vm.$nextTick();
    // After uploading files, emit refreshPhotoList event
    expect(wrapper.emitted().refreshPhotoList[0]).toEqual([]);
    // Close dialog
    await wrapper.findComponent('[data-test-id="finish-button"]').trigger('click');
    await vm.$nextTick();
    expect(vm.files.length).toEqual(0);
  });
});
