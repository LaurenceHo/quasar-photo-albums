import { Album } from 'components/models';
import { computed, ref } from 'vue';

const albumToBeUpdate = ref({
  id: '',
  albumCover: '',
  albumName: '',
  description: '',
  tags: [],
  isPrivate: true,
  order: 0,
} as Album);
const selectedPhotosList = ref([] as string[]);
const currentPhotoToBeRenamed = ref('');

export default function SelectedItemsComposable() {
  const setCurrentPhotoToBeRenamed = (photoKey: string) => {
    currentPhotoToBeRenamed.value = photoKey;
  };

  const setSelectedPhotosList = (photos: string[]) => {
    selectedPhotosList.value = photos;
  };

  const setAlbumToBeUpdated = (album: Album) => {
    albumToBeUpdate.value = album;
  };

  return {
    getCurrentPhotoToBeRenamed: computed(() => currentPhotoToBeRenamed.value),
    setCurrentPhotoToBeRenamed,
    currentPhotoToBeRenamed,

    getSelectedPhotoList: computed(() => selectedPhotosList.value),
    setSelectedPhotosList,
    selectedPhotosList,

    getAlbumToBeUpdate: computed(() => albumToBeUpdate.value),
    setAlbumToBeUpdated,
    albumToBeUpdate,
  };
}
