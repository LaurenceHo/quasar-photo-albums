<template>
  <q-dialog v-model="getUpdateAlbumDialogState" persistent>
    <q-card :style="$q.screen.gt.xs ? 'min-width: 500px' : 'min-width: 360px'">
      <q-card-section>
        <div class="text-h6">{{ getAlbumToBeUpdate.id ? 'Edit' : 'New' }} Album</div>
      </q-card-section>

      <q-form @submit.prevent.stop="confirmUpdateAlbum">
        <q-card-section class="q-pt-none scroll" style="max-height: 50vh">
          <q-toggle
            v-model="privateAlbum"
            :disable="isProcessing"
            checked-icon="mdi-lock"
            color="primary"
            icon="mdi-lock-open"
            label="Private album?"
            left-label
          />
          <q-select
            v-model="selectedYear"
            class="q-pb-lg"
            :options="yearOptions"
            label="Year"
            outlined
            :disable="getAlbumToBeUpdate.id !== ''"
            :rules="[(val: string) => !!val || 'Year is required']"
          />
          <q-input
            v-model="albumId"
            :disable="getAlbumToBeUpdate.id !== ''"
            :hint="getAlbumToBeUpdate.id ? '' : 'Once album is created, album id cannot be changed.'"
            :rules="[
              (val: string) => !!val || 'Album id is required',
              (val: string) =>
                /^[a-z0-9\s-_]*$/.test(val) || 'Only lowercase alphanumeric, space, underscore and dash are allowed',
            ]"
            autofocus
            class="q-pb-xl"
            counter
            label="Album id"
            maxlength="30"
            outlined
            stack-label
          />
          <q-input
            v-model="albumName"
            :rules="[(val: string) => !!val || 'Album name is required']"
            autofocus
            class="q-pb-xl"
            counter
            label="Album name"
            maxlength="50"
            outlined
            stack-label
          />
          <q-input
            v-model="albumDesc"
            :disable="isProcessing"
            autofocus
            class="q-pb-xl"
            counter
            label="Album description"
            maxlength="200"
            outlined
            stack-label
            type="textarea"
          />
          <q-select
            v-model="selectedAlbumTags"
            :options="albumTags"
            clearable
            emit-value
            input-debounce="0"
            label="Category"
            multiple
            option-label="tag"
            option-value="tag"
            outlined
            stack-label
            use-chips
            use-input
            new-value-mode="add-unique"
            @filter="filterTags"
          />
          <q-toggle
            v-model="featuredAlbum"
            :disable="isProcessing || privateAlbum"
            checked-icon="mdi-lock"
            color="primary"
            icon="mdi-lock-open"
            label="Featured album?"
            left-label
          />
          <div v-if="privateAlbum" class="q-pb-lg text-grey-7">Cannot be featured album if album is private.</div>
          <q-select
            v-model="selectedPlace"
            :loading="isSearching"
            :options="placeSuggestions"
            clearable
            input-debounce="500"
            label="Location"
            option-label="displayName"
            outlined
            stack-label
            use-input
            @input-value="searchPlace"
          >
            <template #option="place">
              <q-item v-bind="place.itemProps">
                <q-item-section>
                  <q-item-label>
                    <div class="text-h6">{{ place.opt.displayName }}</div>
                    <div class="text-caption">{{ place.opt.formattedAddress }}</div>
                  </q-item-label>
                </q-item-section>
              </q-item>
            </template>
            <template #no-option>
              <q-item>
                <q-item-section class="text-italic text-grey-7"> No suggestion found</q-item-section>
              </q-item>
            </template>
          </q-select>

          <div class="q-pt-md">
            <PhotoLocationMap v-if="selectedPlace" :latitude="locationLatitude" :longitude="locationLongitude" />
          </div>
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn :disable="isProcessing" flat label="Cancel" no-caps @click="resetAlbum" />
          <q-btn
            :label="getAlbumToBeUpdate.id ? 'Update' : 'Create'"
            :loading="isProcessing"
            color="primary"
            no-caps
            type="submit"
            unelevated
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { Album, Place } from 'components/models';
import PhotoLocationMap from 'components/PhotoLocationMap.vue';
import { isEmpty } from 'radash';
import AlbumTagsFilterComposable from 'src/composables/album-tags-filter-composable';
import DialogStateComposable from 'src/composables/dialog-state-composable';
import SelectedItemsComposable from 'src/composables/selected-items-composaable';
import AlbumService from 'src/services/album-service';
import LocationService from 'src/services/location-service';
import { getYearOptions } from 'src/utils/helper';
import { albumStore } from 'stores/album-store';
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import AlbumTagService from 'src/services/album-tag-service';

const locationService = new LocationService();
const albumService = new AlbumService();
const albumTagService = new AlbumTagService();
const store = albumStore();
const router = useRouter();

const { getUpdateAlbumDialogState, setUpdateAlbumDialogState } = DialogStateComposable();
const { getAlbumToBeUpdate, setAlbumToBeUpdated } = SelectedItemsComposable();
const { albumTags, filterTags } = AlbumTagsFilterComposable();

const storedTagsStringArray = computed(() => store.albumTags.map((tag) => tag.tag));

const selectedYear = ref(String(new Date().getFullYear()));
const albumId = ref('');
const albumName = ref('');
const albumDesc = ref('');
const privateAlbum = ref(false);
const featuredAlbum = ref<boolean | null>(null);
const selectedAlbumTags = ref([] as string[]);
const isProcessing = ref(false);
const selectedPlace = ref(null as Place | null);
const placeSuggestions = ref([] as Place[]);
const isSearching = ref(false);
const locationLatitude = computed(() => selectedPlace.value?.location?.latitude || 0);
const locationLongitude = computed(() => selectedPlace.value?.location?.longitude || 0);

const searchPlace = async (searchText: string) => {
  if (searchText) {
    isSearching.value = true;
    const { data } = await locationService.searchPlaces(searchText);
    placeSuggestions.value = data ?? [];
    isSearching.value = false;
  } else {
    placeSuggestions.value = [];
  }
};

const confirmUpdateAlbum = async () => {
  albumId.value = albumId.value.trim();
  albumName.value = albumName.value.trim();

  if (isEmpty(albumId.value) || isEmpty(albumName.value)) {
    return;
  }

  albumDesc.value = albumDesc.value.trim();

  isProcessing.value = true;

  // Remove duplicate tags
  if (!isEmpty(selectedAlbumTags.value)) {
    const tagSet = new Set(selectedAlbumTags.value);
    selectedAlbumTags.value = Array.from(tagSet);
  } else {
    selectedAlbumTags.value = [];
  }

  // Create tag
  if (!isEmpty(selectedAlbumTags.value)) {
    const findNewTags = selectedAlbumTags.value.filter((tag) => !storedTagsStringArray.value.includes(tag));
    if (findNewTags.length > 0) {
      await albumTagService.createAlbumTags(findNewTags.map((tag) => ({ tag })));
    }
  }

  const albumToBeUpdated: Album = {
    year: selectedYear.value,
    id: getAlbumToBeUpdate.value.id || albumId.value,
    albumCover: getAlbumToBeUpdate.value.albumCover || '',
    albumName: albumName.value,
    description: albumDesc.value,
    isPrivate: privateAlbum.value,
    isFeatured: featuredAlbum.value ?? undefined,
    place: selectedPlace.value,
    tags: selectedAlbumTags.value,
  };

  let result;
  if (getAlbumToBeUpdate.value.id) {
    result = await albumService.updateAlbum(albumToBeUpdated);
  } else {
    result = await albumService.createAlbum(albumToBeUpdated);
  }

  if (result.code === 200) {
    await store.getAlbumsByYear(albumToBeUpdated.year, true);
    await router.push({ name: 'AlbumsByYear', params: { year: albumToBeUpdated.year } });
    resetAlbum();
  }
  isProcessing.value = false;
};

const resetAlbum = () => {
  selectedPlace.value = null;
  setAlbumToBeUpdated({
    year: String(new Date().getFullYear()),
    id: '',
    albumName: '',
    albumCover: '',
    description: '',
    tags: [],
    isPrivate: true,
  });
  setUpdateAlbumDialogState(false);
};

const yearOptions = getYearOptions();

watch(
  getUpdateAlbumDialogState,
  (newValue) => {
    if (newValue) {
      selectedYear.value = getAlbumToBeUpdate.value.year || String(new Date().getFullYear());
      albumId.value = getAlbumToBeUpdate.value.id;
      albumName.value = getAlbumToBeUpdate.value.albumName;
      albumDesc.value = getAlbumToBeUpdate.value.description || '';
      privateAlbum.value = getAlbumToBeUpdate.value.isPrivate;
      featuredAlbum.value = getAlbumToBeUpdate.value.isFeatured || null;
      selectedAlbumTags.value = getAlbumToBeUpdate.value.tags || [];
      selectedPlace.value = getAlbumToBeUpdate.value.place || null;
    }
  },
  { deep: true, immediate: true }
);
</script>
