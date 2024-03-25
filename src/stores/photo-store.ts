import { Album, Photo } from 'components/models';
import { defineStore } from 'pinia';
import { LocalStorage } from 'quasar';
import PhotoService from 'src/services/photo-service';
import { notifyError } from 'src/utils/helper';
import { albumStore } from 'stores/album-store';

export interface PhotoStoreState {
  selectedAlbumItem: Album;
  photoList: Photo[];
  fetchingPhotos: boolean;
}

const photoService = new PhotoService();

const initialState: PhotoStoreState = {
  selectedAlbumItem: {
    id: '',
    albumName: '',
    albumCover: '',
    description: '',
    tags: [],
    isPrivate: false,
    order: 0,
  },
  photoList: [],
  fetchingPhotos: false,
};

export const photoStore = defineStore('photos', {
  state: () => initialState,

  getters: {
    findPhotoIndex:
      (state: PhotoStoreState) =>
      (photoId: string): number =>
        state.photoList.findIndex((photo) => photo.key === `${state.selectedAlbumItem.id}/${photoId}`),

    findPhotoByIndex:
      (state: PhotoStoreState) =>
      (index: number): Photo | undefined =>
        state.photoList[index],

    isAlbumCover: (state: PhotoStoreState) => (photoKey: string) => state.selectedAlbumItem.albumCover === photoKey,
  },

  actions: {
    async getPhotos(albumId: string, refreshPhotosList?: boolean) {
      const useAlbumStore = albumStore();
      const albumItem = useAlbumStore.getAlbumById(albumId);
      if (albumItem?.id) {
        // Only fetch photos when album id is updated
        if (albumId !== this.selectedAlbumItem.id || refreshPhotosList) {
          this.selectedAlbumItem = albumItem;
          if (!refreshPhotosList) {
            this.photoList = [];
          }

          this.fetchingPhotos = true;
          const { data, code } = await photoService.getPhotosByAlbumId(albumId);
          this.fetchingPhotos = false;

          this.photoList = data ?? [];
          if (code && code !== 200) {
            if (code > 400 && code < 500) {
              LocalStorage.remove('ALL_ALBUMS');
              await useAlbumStore.getAllAlbumInformation();
            }

            notifyError('Oops, something wrong. You will be redirected to the home page in 3 seconds.', true);
            setTimeout(() => window.location.assign('/'), 3000);
          }
        }
      } else {
        notifyError("Album doesn't exist. You will be redirected to the home page in 3 seconds", true);
        setTimeout(() => window.location.assign('/'), 3000);
      }
    },
  },
});
