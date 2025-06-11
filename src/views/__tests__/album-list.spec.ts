import AlbumList from '@/views/AlbumList.vue';
import { createTestingPinia } from '@pinia/testing';
import { QueryClient, VueQueryPlugin, type VueQueryPluginOptions } from '@tanstack/vue-query';
import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';

vi.mock('@/composables/use-album-filter', () => ({
  default: vi.fn(() => ({
    filterState: ref({ sortOrder: 'asc', privateOnly: false, selectedTags: [] }),
    filteredAlbums: ref([]),
  })),
}));

vi.mock('@/composables/use-albums', () => ({
  default: vi.fn(() => ({
    isFetchingAlbums: ref(false),
    fetchAlbumsByYear: vi.fn().mockResolvedValue([]),
  })),
}));

vi.mock('@/composables/use-featured-albums', () => ({
  default: vi.fn(() => ({
    isFetching: ref(false),
    data: ref([]),
  })),
}));

const mockPush = vi.fn();

vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({
    params: {},
  })),
  useRouter: vi.fn(() => ({
    push: mockPush,
  })),
}));

vi.mock('primevue/usetoast', () => ({
  useToast: vi.fn(() => ({
    add: vi.fn(),
  })),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

describe('AlbumList.vue', () => {
  let wrapper: any;

  beforeEach(() => {
    const options: VueQueryPluginOptions = {
      queryClient,
    };

    const pinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: false,
    });

    wrapper = mount(AlbumList, {
      global: {
        plugins: [[VueQueryPlugin, options], pinia],
        stubs: {
          Button: true,
          SelectYear: true,
          SelectTags: true,
          Paginator: true,
          ToggleSwitch: true,
          Skeleton: true,
          Carousel: true,
          Album: true,
          ScrollTop: true,
          CreateAlbum: true,
          CreateAlbumTag: true,
          UpdateAlbumTags: true,
          Toast: true,
        },
      },
    });
  });

  it('renders the component', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('toggles sort order when the sort button is clicked', async () => {
    const sortButton = wrapper.findComponent({ name: 'Button' });
    await sortButton.trigger('click');
    expect(wrapper.vm.sortOrder).toBe('desc');
  });

  it('updates selected year when a year is selected', async () => {
    const selectYear = wrapper.findComponent({ name: 'SelectYear' });
    await selectYear.vm.$emit('select-year', '2023');

    // Check the shared mockPush function
    expect(mockPush).toHaveBeenCalledWith({
      name: 'albumsByYear',
      params: { year: '2023' },
    });
  });

  it('updates selected tags when tags are selected', async () => {
    const selectTags = wrapper.findComponent({ name: 'SelectTags' });
    await selectTags.vm.$emit('select-tags', ['tag1', 'tag2']);
    expect(wrapper.vm.filterState.selectedTags).toEqual(['tag1', 'tag2']);
  });

  it('updates pagination when page changes', async () => {
    const paginator = wrapper.findComponent({ name: 'Paginator' });
    await paginator.vm.$emit('page', { page: 2, rows: 20 });
    expect(wrapper.vm.pageNumber).toBe(3);
    expect(wrapper.vm.itemsPerPage).toBe(20);
  });

  it('displays featured albums when available', async () => {
    wrapper.vm.featuredAlbums = [{ id: 1, title: 'Featured Album' }];
    await wrapper.vm.$nextTick();
    expect(wrapper.findComponent({ name: 'Carousel' }).exists()).toBe(true);
  });

  it('displays a skeleton loader when fetching albums', async () => {
    wrapper.vm.isFetchingAlbums = true;
    await wrapper.vm.$nextTick();
    expect(wrapper.findAllComponents({ name: 'Skeleton' }).length).toBeGreaterThan(0);
  });

  it('displays "No results" when no albums are available', async () => {
    wrapper.vm.filteredAlbums = [];
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain('No results.');
  });

  it('displays the correct number of albums', async () => {
    wrapper.vm.filteredAlbums = [{ id: 1 }, { id: 2 }, { id: 3 }];
    await wrapper.vm.$nextTick();
    expect(wrapper.findAllComponents({ name: 'Album' }).length).toBe(3);
  });

  it('shows the private album toggle for admin users', async () => {
    wrapper.vm.isAdmin = true;
    await wrapper.vm.$nextTick();
    expect(wrapper.findComponent({ name: 'ToggleSwitch' }).exists()).toBe(true);
  });
});
