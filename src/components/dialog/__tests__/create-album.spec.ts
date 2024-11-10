import router from '@/router';
import { AlbumService } from '@/services/album-service';
import { LocationService } from '@/services/location-service';
import { flushPromises, mount } from '@vue/test-utils';
import AutoComplete from 'primevue/autocomplete';
import Button from 'primevue/button';
import PrimeVue from 'primevue/config';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Textarea from 'primevue/textarea';
import ToggleSwitch from 'primevue/toggleswitch';
import { useToast } from 'primevue/usetoast';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, ref } from 'vue';
import { VueQueryPlugin, QueryClient, type VueQueryPluginOptions } from '@tanstack/vue-query';
import CreateAlbum from '../CreateAlbum.vue';

// Mock services
vi.mock('@/services/album-service', () => ({
  AlbumService: {
    createAlbum: vi.fn().mockResolvedValue({ code: 200 }),
    updateAlbum: vi.fn().mockResolvedValue({ code: 200 })
  }
}));

vi.mock('@/services/album-tag-service', () => ({
  AlbumTagService: {
    createAlbumTags: vi.fn().mockResolvedValue({ code: 200 })
  }
}));

vi.mock('@/services/location-service', () => ({
  LocationService: {
    searchPlaces: vi.fn()
  }
}));

// Mock composables
vi.mock('primevue/usetoast', () => ({
  useToast: vi.fn()
}));

const dialogState = ref(true);
const mockSetUpdateAlbumDialogState = vi.fn((state: boolean) => {
  dialogState.value = state;
});

// Mock dialog context
vi.mock('@/composables/dialog-context', () => ({
  default: () => ({
    updateAlbumDialogState: computed(() => dialogState.value),
    setUpdateAlbumDialogState: mockSetUpdateAlbumDialogState,
    createAlbumTagDialogState: ref(false),
    setCreateAlbumTagDialogState: vi.fn()
  })
}));

// Mock albums context
vi.mock('@/composables/albums-context', () => ({
  default: () => ({
    albumToBeUpdate: ref({
      year: String(new Date().getFullYear()),
      id: '',
      albumName: '',
      albumCover: '',
      description: '',
      tags: [],
      isPrivate: true
    }),
    setAlbumToBeUpdated: vi.fn(),
    fetchAlbumsByYear: vi.fn()
  })
}));

// Mock album tags context
vi.mock('@/composables/album-tags-context', () => ({
  default: () => ({
    albumTags: ref([]),
    fetchAlbumTags: vi.fn()
  })
}));

// Create a test query client for tests
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false // disable retries for testing
    }
  }
});

describe('CreateAlbum', () => {
  const mountComponent = () => {
    // Reset dialog state before each mount
    dialogState.value = true;
    const options: VueQueryPluginOptions = {
      queryClient
    };

    return mount(CreateAlbum, {
      global: {
        plugins: [router, PrimeVue, [VueQueryPlugin, options]],
        stubs: {
          Dialog: {
            template: '<div class="p-dialog" v-if="visible"><slot name="header"></slot><slot></slot></div>',
            props: ['visible']
          },
          FloatLabel: {
            template: '<div class="p-float-label"><slot></slot></div>'
          },
          Button,
          InputText,
          Select,
          ToggleSwitch,
          AutoComplete,
          Textarea
        }
      }
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear(); // Clear query cache between tests
    (useToast as any).mockReturnValue({
      add: vi.fn()
    });
  });

  it('renders correctly with default values for new album', async () => {
    const wrapper = mountComponent();

    expect(wrapper.find('.p-dialog').exists()).toBe(true);
    expect(wrapper.find('[data-test-id="dialog-title"]').text()).toBe('New Album');
    expect(wrapper.find('[data-test-id="select-album-year"]').exists()).toBe(true);
    expect(wrapper.find('[data-test-id="input-album-id"]').exists()).toBe(true);
    expect(wrapper.find('[data-test-id="input-album-name"]').exists()).toBe(true);
    expect(wrapper.find('[data-test-id="input-album-desc"]').exists()).toBe(true);
  });

  it('validates required fields before submission', async () => {
    const wrapper = mountComponent();
    const submitButton = wrapper.find('[data-test-id="submit-album-button"]');

    // Initially button should be disabled due to validation
    expect(submitButton.attributes('disabled')).toBeDefined();

    // Fill in required fields
    await wrapper.find('[data-test-id="input-album-id"]').setValue('test-album');
    await wrapper.find('[data-test-id="input-album-name"]').setValue('Test Album');

    // Button should now be enabled
    expect(submitButton.attributes('disabled')).toBeUndefined();
  });

  it('handles album ID validation rules correctly', async () => {
    const wrapper = mountComponent();
    const albumIdInput = wrapper.find('[data-test-id="input-album-id"]');

    // Test minimum length
    await albumIdInput.setValue('a');
    expect(wrapper.text()).toContain('It must be at least 2 characters long');

    // Test maximum length
    await albumIdInput.setValue('a'.repeat(31));
    expect(wrapper.text()).toContain('It cannot exceed 30 characters');

    // Test invalid characters
    await albumIdInput.setValue('Invalid@Album#ID');
    expect(wrapper.text()).toContain('Only lowercase alphanumeric, space, underscore and dash are allowed');

    // Test valid input
    await albumIdInput.setValue('valid-album-id');
    expect(wrapper.text()).not.toContain('Only lowercase alphanumeric');
  });

  it('toggles featured album based on private album status', async () => {
    const wrapper = mountComponent();
    const privateToggle = wrapper.findComponent(ToggleSwitch);
    const featuredToggle = wrapper.findAllComponents(ToggleSwitch)[1];

    // Default private album is true
    expect(privateToggle.props('modelValue')).toBe(true);
    expect(featuredToggle.classes()).toContain('p-disabled');

    // Disable private album
    await privateToggle.setValue(false);
    expect(privateToggle.props('modelValue')).toBe(false);
    expect(featuredToggle.classes()).not.toContain('p-disabled');

    // Set featured to true
    await featuredToggle.setValue(true);
    expect(featuredToggle.props('modelValue')).toBe(true);

    // Enable private album
    await privateToggle.setValue(true);
    expect(privateToggle.props('modelValue')).toBe(true);

    // Featured should automatically be set to false
    expect(featuredToggle.props('modelValue')).toBe(false);
    // Featured toggle should be disabled
    expect(featuredToggle.classes()).toContain('p-disabled');
  });

  it('handles place search correctly', async () => {
    const wrapper = mountComponent();
    const autoComplete = wrapper.findComponent(AutoComplete);

    const mockPlaces = [
      { displayName: 'New York', formattedAddress: 'NY, USA', location: { latitude: 40.7128, longitude: -74.006 } }
    ];

    vi.mocked(LocationService.searchPlaces).mockResolvedValueOnce({ code: 200, status: 'success', data: mockPlaces });

    // Trigger place search
    autoComplete.vm.$emit('complete', { query: 'New York' });

    expect(LocationService.searchPlaces).toHaveBeenCalledWith('New York');
  });

  it('successfully creates a new album', async () => {
    const wrapper = mountComponent();
    const mockAlbum = {
      year: '2024',
      id: 'test-album',
      albumName: 'Test Album',
      description: 'Test Description',
      isPrivate: true,
      tags: ['test']
    };

    // Fill in form
    await wrapper.find('[data-test-id="input-album-id"]').setValue(mockAlbum.id);
    await wrapper.find('[data-test-id="input-album-name"]').setValue(mockAlbum.albumName);
    await wrapper.find('[data-test-id="input-album-desc"]').setValue(mockAlbum.description);

    // Submit form
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    const mutation = queryClient.getMutationCache().getAll()[0];
    expect(mutation.state.status).toBe('success');

    const toast = useToast();
    expect(toast.add).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'success',
        summary: 'Success'
      })
    );
  });

  it('handles error during album creation', async () => {
    const wrapper = mountComponent();

    // Make the service fail
    vi.mocked(AlbumService.createAlbum).mockRejectedValueOnce(new Error('Failed to create'));

    // Fill in required fields
    await wrapper.find('[data-test-id="input-album-id"]').setValue('test-album');
    await wrapper.find('[data-test-id="input-album-name"]').setValue('Test Album');

    await wrapper.find('form').trigger('submit');
    await flushPromises();

    const mutation = queryClient.getMutationCache().getAll()[0];
    expect(mutation.state.status).toBe('error');

    const toast = useToast();
    expect(toast.add).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'error',
        summary: 'Error'
      })
    );
  });

  it('closes dialog when form is reset', async () => {
    const wrapper = mountComponent();
    await wrapper.find('[data-test-id="cancel-button"]').trigger('click');

    expect(mockSetUpdateAlbumDialogState).toHaveBeenCalledWith(false);
    expect(dialogState.value).toBe(false);
  });
});
