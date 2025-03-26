import PhotoDetail from '@/components/PhotoDetail.vue';
import router from '@/router';
import { QueryClient, VueQueryPlugin, type VueQueryPluginOptions } from '@tanstack/vue-query';
import { mount } from '@vue/test-utils';
import PrimeVue from 'primevue/config';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';

// Mock vue-router
vi.mock('vue-router', async () => {
  const actual = (await vi.importActual('vue-router')) as any;
  return {
    ...actual,
    useRoute: vi.fn(() => ({
      params: { albumId: 'album', year: '2023' },
      query: { photo: 'photo1' },
    })),
    useRouter: vi.fn(() => ({
      replace: vi.fn(),
      push: vi.fn(),
    })),
  };
});

vi.mock('primevue/usetoast', () => ({
  useToast: vi.fn(() => ({
    add: vi.fn(),
  })),
}));

vi.mock('../../composables/use-photos', () => ({
  default: vi.fn().mockImplementation(() => ({
    photosInAlbum: ref([
      { key: 'album/photo1.jpg', url: 'https://example.com/photo1.jpg' },
      { key: 'album/photo2.jpg', url: 'https://example.com/photo2.jpg' },
    ]),
    isFetchingPhotos: ref(false),
    findPhotoByIndex: vi.fn((index) => ({
      key: `album/photo${index + 1}.jpg`,
      url: `https://example.com/photo${index + 1}.jpg`,
    })),
    findPhotoIndex: vi.fn((photoId) => (photoId === 'photo1' ? 0 : 1)),
  })),
}));

vi.mock('@/composables/use-user-config', () => ({
  default: vi.fn().mockImplementation(() => ({
    isAdmin: ref(false),
  })),
}));

vi.mock('exifreader', () => ({
  default: {
    load: vi.fn().mockResolvedValue({}),
  },
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

describe('PhotoDetail.vue', () => {
  let wrapper: ReturnType<typeof mount>;
  const options: VueQueryPluginOptions = {
    queryClient,
  };

  beforeEach(() => {
    wrapper = mount(PhotoDetail, {
      global: {
        plugins: [router, PrimeVue, [VueQueryPlugin, options]],
      },
    });
  });

  it('renders correctly', () => {
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('img').exists()).toBe(true);
  });

  it('displays the correct photo index and total', async () => {
    await wrapper.vm.$nextTick();
    expect(wrapper.find('[data-test-id="photo-index"]').text()).toBe('(1/2)');
  });

  it('displays correct photo file name', async () => {
    await wrapper.vm.$nextTick();
    expect(wrapper.find('[data-test-id="photo-file-name"]').text()).toBe('photo1.jpg');
  });

  it('computes localDateTime correctly', async () => {
    const { vm } = wrapper as any;

    vm.exifTags = {
      DateTime: { description: '2023:11:10 12:00:00' },
      OffsetTime: { value: ['+10:00'] },
    };
    await wrapper.vm.$nextTick();
    expect(vm.localDateTime).toContain('2023');
    expect(vm.localDateTime).toContain('+10:00');
  });

  it('calls nextPhoto with correct arguments', async () => {
    const { vm } = wrapper as any;

    const spy = vi.spyOn(vm, 'nextPhoto');
    await wrapper.find('[data-test-id="next-photo-button"]').trigger('click');
    expect(spy).toHaveBeenCalledWith(1);
    await wrapper.find('[data-test-id="previous-photo-button"]').trigger('click');
    expect(spy).toHaveBeenCalledWith(-1);
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
    vm.nextPhoto(1);
    expect(vm.selectedImageIndex).toBe(0);
    vm.nextPhoto(-1);
    expect(vm.selectedImageIndex).toBe(1);
  });

  it('computes latitude and longitude correctly', async () => {
    const { vm } = wrapper as any;

    vm.exifTags = {
      GPSLatitude: { description: '27.98785' },
      GPSLatitudeRef: { value: ['N'] },
      GPSLongitude: { description: '86.925026' },
      GPSLongitudeRef: { value: ['E'] },
    };
    await wrapper.vm.$nextTick();
    expect(vm.latitude).toBe(27.98785);
    expect(vm.longitude).toBe(86.925026);
  });

  it('computes negative latitude and longitude correctly', async () => {
    const { vm } = wrapper as any;

    vm.exifTags = {
      GPSLatitude: { description: '33.7490' },
      GPSLatitudeRef: { value: ['S'] },
      GPSLongitude: { description: '84.3880' },
      GPSLongitudeRef: { value: ['W'] },
    };
    await wrapper.vm.$nextTick();
    expect(vm.latitude).toBe(-33.749);
    expect(vm.longitude).toBe(-84.388);
  });

  it('computes isPhotoLandscape correctly', async () => {
    const { vm } = wrapper as any;

    vm.exifTags = {
      'Image Width': { value: 1920 },
      'Image Height': { value: 1080 },
      Orientation: { value: 1 },
    };
    await wrapper.vm.$nextTick();
    expect(vm.isPhotoLandscape).toBe(true);

    vm.exifTags = {
      'Image Width': { value: 1080 },
      'Image Height': { value: 1920 },
    };
    await wrapper.vm.$nextTick();
    expect(vm.isPhotoLandscape).toBe(false);
  });

  it('computes isPanoramaPhoto correctly', async () => {
    const { vm } = wrapper as any;

    // Test UsePanoramaViewer flag
    vm.exifTags = {
      ProjectionType: { description: 'equirectangular' },
    };
    await wrapper.vm.$nextTick();
    expect(vm.isPanoramaPhoto).toBe(true);

    // Test RICOH THETA detection
    vm.exifTags = {
      Make: { description: 'RICOH' },
      Model: { description: 'THETA Z1' },
    };
    expect(vm.isPanoramaPhoto).toBe(true);

    // Test Samsung Gear 360 detection
    vm.exifTags = {
      Make: { description: 'SAMSUNG' },
      Model: { description: 'GEAR 360' },
    };
    expect(vm.isPanoramaPhoto).toBe(true);

    // Test filename with '360'
    vm.exifTags = {};
    vm.photoFileName = 'photo360.jpg';
    expect(vm.isPanoramaPhoto).toBe(true);

    // Test filename with 'pano'
    vm.photoFileName = 'panorama.jpg';
    expect(vm.isPanoramaPhoto).toBe(true);

    // Test non-panorama case
    vm.exifTags = {
      'Image Width': { value: 1920 },
      'Image Height': { value: 1080 },
    };
    vm.photoFileName = 'regular.jpg';
    expect(vm.isPanoramaPhoto).toBe(false);
  });
});
