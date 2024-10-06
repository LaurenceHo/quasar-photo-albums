import AlbumsContext, { initialAlbum } from '@/composables/albums-context';
import type { Photo } from '@/schema';
import { PhotoService } from '@/services/photo-service';
import { FILTERED_ALBUMS_BY_YEAR } from '@/utils/local-storage-key';
import { computed, ref } from 'vue';

const photosInAlbum = ref([] as Photo[]);
const isFetchingPhotos = ref(false);
const selectedPhotos = ref([] as string[]);
const currentPhotoToBeRenamed = ref('');

export default function PhotosContext() {
  const { currentAlbum, setCurrentAlbum } = AlbumsContext();

  const getIsFetchingPhotos = computed(() => isFetchingPhotos.value);
  const getPhotosInAlbum = computed(() => photosInAlbum.value);
  const getCurrentPhotoToBeRenamed = computed(() => currentPhotoToBeRenamed.value);
  const getSelectedPhotos = computed(() => selectedPhotos.value);

  const fetchPhotos = async (albumId: string, albumYear: string, refreshPhotosList?: boolean) => {
    // Only fetch photos when album id is updated
    if (albumId !== currentAlbum.value.id || refreshPhotosList) {
      isFetchingPhotos.value = true;
      setCurrentAlbum(initialAlbum);

      if (!refreshPhotosList) {
        photosInAlbum.value = [];
      }

      try {
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
      } catch (error) {
        isFetchingPhotos.value = false;
        throw error;
      }
      isFetchingPhotos.value = false;
    }
  };

  const findPhotoByIndex = (index: number): Photo | undefined => photosInAlbum.value[index];

  const findPhotoIndex = (photoId: string): number =>
    photosInAlbum.value.findIndex((photo) => photo.key === `${currentAlbum.value.id}/${photoId}`);

  const setCurrentPhotoToBeRenamed = (photoKey: string) => {
    currentPhotoToBeRenamed.value = photoKey;
  };

  const setSelectedPhotos = (photos: string[]) => {
    selectedPhotos.value = photos;
  };

  return {
    photosInAlbum: getPhotosInAlbum,
    currentPhotoToBeRenamed: getCurrentPhotoToBeRenamed,
    selectedPhotos: getSelectedPhotos,
    isFetchingPhotos: getIsFetchingPhotos,
    fetchPhotos,
    setCurrentPhotoToBeRenamed,
    setSelectedPhotos,
    findPhotoByIndex,
    findPhotoIndex
  };
}
