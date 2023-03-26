import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import UploadPhotosDialog from '../../../../../src/components/dialog/UploadPhotosDialog.vue';
import { QDialog } from 'quasar';

installQuasarPlugin({ components: { QDialog } });

describe('UploadPhotosDialog.vue', () => {
  it('check upload button', async () => {
    const wrapper = mount(UploadPhotosDialog, {
      props: {
        albumId: 'testId',
      },
      global: {
        stubs: {
          QDialog: {
            template: '<div></div>',
          },
        },
      },
    });

    const { vm } = wrapper as any;
    await vm.setUploadPhotoDialogState(true);
    await vm.$nextTick();

    expect(vm.isUploading).toBeFalsy();
    expect(vm.isCompleteUploading).toBeFalsy();
    vm.files = ['a', 'b', 'c'];
    await vm.$nextTick();
    expect(vm.files.length).toEqual(3);
    await wrapper.setProps({ albumId: 'testId2' });
    expect(vm.files.length).toEqual(0);
  });
});
