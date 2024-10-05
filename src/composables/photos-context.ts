import AlbumsContext, { initialAlbum } from '@/composables/albums-context';
import type { Photo } from '@/schema';
import { PhotoService } from '@/services/photo-service';
import { FILTERED_ALBUMS_BY_YEAR } from '@/utils/local-storage-key';
import { useQuery } from '@tanstack/vue-query';
import { computed, ref, watch } from 'vue';

const photosInAlbum = ref([] as Photo[]);
const selectedPhotos = ref([] as string[]);
const currentPhotoToBeRenamed = ref('');
const isFetchingPhotos = ref(false);

const { currentAlbum, setCurrentAlbum } = AlbumsContext();

export const PhotosContext = () => {
  const getPhotosInAlbum = computed(() => photosInAlbum.value);
  const getCurrentPhotoToBeRenamed = computed(() => currentPhotoToBeRenamed.value);
  const getSelectedPhotos = computed(() => selectedPhotos.value);
  const getIsFetchingPhotos = computed(() => isFetchingPhotos.value);

  const findPhotoByIndex = (index: number): Photo | undefined => photosInAlbum.value[index];

  const findPhotoIndex = (photoId: string): number =>
    photosInAlbum.value.findIndex((photo) => photo.key === `${currentAlbum.value.id}/${photoId}`);

  const setCurrentPhotoToBeRenamed = (photoKey: string) => {
    currentPhotoToBeRenamed.value = photoKey;
  };

  const setSelectedPhotos = (photos: string[]) => {
    selectedPhotos.value = photos;
  };

  const setPhotosInAlbum = (photos: Photo[]) => {
    photosInAlbum.value = photos;
  };

  return {
    photosInAlbum: getPhotosInAlbum,
    currentPhotoToBeRenamed: getCurrentPhotoToBeRenamed,
    selectedPhotos: getSelectedPhotos,
    isFetchingPhotos: getIsFetchingPhotos,
    setPhotosInAlbum,
    setCurrentPhotoToBeRenamed,
    setSelectedPhotos,
    findPhotoByIndex,
    findPhotoIndex
  };
};

export const FetchPhotos = (albumId: string, albumYear: string) => {
  const enabled = computed(() => !!albumId && !!albumYear);
  const queryKey = ['getPhotosByAlbumId', albumId, albumYear];

  const { isLoading, refetch, isError } = useQuery({
    queryKey,
    queryFn: async () => {
      setCurrentAlbum(initialAlbum);

      const { data, code } = await PhotoService.getPhotosByAlbumId(albumId, albumYear);

      setCurrentAlbum(data?.album ?? initialAlbum);
      photosInAlbum.value = data?.photos ?? [];

      if (code && code !== 200) {
        if (code === 401 || code === 403) {
          // Temporarily set selected album id to the album id from URL to avoid re-fetching photos
          setCurrentAlbum({ ...currentAlbum.value, id: albumId });
          localStorage.removeItem(FILTERED_ALBUMS_BY_YEAR);
        }
        setTimeout(() => window.location.assign('/'), 3000);
      }
      return data;
    },
    enabled
  });

  const refreshPhotos = () => {
    photosInAlbum.value = [];
    refetch();
  };

  watch(
    isLoading,
    (newValue) => {
      isFetchingPhotos.value = newValue;
    },
    { immediate: true }
  );

  return {
    isFetchingPhotosError: isError,
    refreshPhotos
  };
};
