import { describe, expect, it, jest } from '@jest/globals';
import { createTestingPinia } from '@pinia/testing';
import { installQuasarPlugin, qLayoutInjections } from '@quasar/quasar-app-extension-testing-unit-jest';
import { flushPromises, mount } from '@vue/test-utils';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import PhotoList from 'pages/PhotoList';
import { mockAlbumList } from '../mock-data';
import { mockRouter as router } from '../mock-router';

installQuasarPlugin();

jest.mock('src/services/photo-service', () =>
  jest.fn().mockImplementation(() => ({
    getPhotosByAlbumId: () =>
      Promise.resolve([
        {
          url: 'https://ik.imagekit.io/oeqc5vsr3tf/2020-02-15/batch_2019-08-24%2010.32.31.jpg',
          key: '2020-02-15/batch_2019-08-24 10.32.31.jpg',
        },
        {
          url: 'https://ik.imagekit.io/oeqc5vsr3tf/2020-02-15/batch_2019-08-24%2010.38.09.jpg',
          key: '2020-02-15/batch_2019-08-24 10.38.09.jpg',
        },
        {
          url: 'https://ik.imagekit.io/oeqc5vsr3tf/2020-02-15/batch_2019-08-24%2010.39.21.jpg',
          key: '2020-02-15/batch_2019-08-24 10.39.21.jpg',
        },
      ]),
  }))
);
describe('PhotoList.vue', () => {
  it('Check photo list', async () => {
    await router.push('/album/Food');
    await router.isReady();

    const wrapper = mount(PhotoList, {
      global: {
        plugins: [
          router,
          createTestingPinia({
            initialState: {
              album: {
                allAlbumList: mockAlbumList,
                albumTags: ['sport', 'food', 'hiking', 'secret'],
              },
            },
            stubActions: false,
          }),
        ],
        provide: qLayoutInjections(),
        stubs: ['PhotoDetailDialog'],
      },
    });

    await flushPromises();
    const { vm } = wrapper as any;
    await vm.$nextTick();
    expect(vm.photosInAlbum.length).toEqual(3);
    expect(wrapper.findAll('[data-test-id="photo-item"]').length).toEqual(3);
    expect(wrapper.findAll('[data-test-id="album-tag"]').length).toEqual(2);
    expect(wrapper.find('[data-test-id="album-name"]').text()).toEqual('Food title');
    expect(wrapper.find('[data-test-id="album-desc"]').text()).toEqual('Food desc');
  });
});
