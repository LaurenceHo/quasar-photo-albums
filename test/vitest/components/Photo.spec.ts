import { createTestingPinia } from '@pinia/testing';
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { Loading, LoadingBar, Notify } from 'quasar';
import { beforeEach, describe, expect, it } from 'vitest';
import Photo from '../../../src/components/Photo.vue';
import { mockRouter as router } from '../mock-router';

installQuasarPlugin({ plugins: { Loading, LoadingBar, Notify } });

describe('Photo.vue', () => {
  let wrapper: any;

  beforeEach(async () => {
    wrapper = mount(Photo, {
      props: {
        photoStyle: 'grid',
        photo: {
          key: 'photo1.jpg',
          url: 'album1/photo1.jpg',
        },
      },
      global: {
        plugins: [
          router,
          createTestingPinia({
            initialState: {
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

  it('Check photo item', async () => {
    const { vm } = wrapper as any;
    await vm.$nextTick();
    expect(wrapper.find('[data-test-id="edit-photo-button"]').exists()).toBe(true);
    expect(wrapper.find('[data-test-id="detail-photo-item"]').exists()).toBe(false);
  });
});
