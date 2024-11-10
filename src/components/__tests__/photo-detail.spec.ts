import router from '@/router';
import PrimeVue from 'primevue/config';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import PhotoDetail from '@/components/PhotoDetail.vue';
import { ref } from 'vue';

vi.mock('primevue/usetoast', () => ({
  useToast: vi.fn(() => ({
    add: vi.fn()
  }))
}));

vi.mock('../../composables/photos-context', () => ({
  default: vi.fn().mockImplementation(() => ({
    photosInAlbum: ref([
      { key: 'photo1', url: 'https://example.com/photo1.jpg' },
      { key: 'photo2', url: 'https://example.com/photo2.jpg' }
    ]),
    isFetchingPhotos: ref(false),
    findPhotoByIndex: vi.fn(),
    findPhotoIndex: vi.fn()
  }))
}));

describe('PhotoDetail.vue', () => {
  let wrapper: ReturnType<typeof mount>;
  beforeEach(() => {
    wrapper = mount(PhotoDetail, {
      global: {
        plugins: [PrimeVue, router]
      }
    });
  });

  it('renders correctly', () => {
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('img').exists()).toBe(true);
  });

  it('displays the correct number of photos in the album', async () => {
    const { vm } = wrapper as any;

    vm.selectedImageIndex = 0;
    await wrapper.vm.$nextTick();
    expect(wrapper.find('[data-test-id="photo-index"]').text()).toContain('1/2');
  });

  it.skip('computes localDateTime correctly', async () => {
    const { vm } = wrapper as any;

    vm.exifTags = {
      DateTime: { description: '2023:11:10 12:00:00' },
      OffsetTime: { value: ['+10:00'] }
    };
    await wrapper.vm.$nextTick();
    expect(vm.localDateTime).toBe('10/11/2023, 12:00:00 pm +10:00');
  });

  it('calls nextPhoto with correct arguments', async () => {
    const { vm } = wrapper as any;

    const spy = vi.spyOn(vm, 'nextPhoto');
    await wrapper.find('[data-test-id="next-photo-button"]').trigger('click');
    expect(spy).toHaveBeenCalledWith(1);
  });

  it('emits closePhotoDetail event', async () => {
    await wrapper.find('[data-test-id="close-button"]').trigger('click');
    expect(wrapper.emitted('closePhotoDetail')).toBeTruthy();
  });

  it('handles photo navigation correctly', async () => {
    const { vm } = wrapper as any;

    vm.selectedImageIndex = 0;
    vm.nextPhoto(1);
    expect(vm.selectedImageIndex).toBe(1);
  });

  it('computes latitude and longitude correctly', async () => {
    const { vm } = wrapper as any;

    vm.exifTags = {
      GPSLatitude: { description: '27.98785' },
      GPSLatitudeRef: { value: ['N'] },
      GPSLongitude: { description: '86.925026' },
      GPSLongitudeRef: { value: ['E'] }
    };
    await wrapper.vm.$nextTick();
    expect(vm.latitude).toBe(27.98785);
    expect(vm.longitude).toBe(86.925026);
  });
});
