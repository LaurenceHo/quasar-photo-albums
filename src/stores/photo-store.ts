import { Photo } from 'components/models';
import { defineStore } from 'pinia';
import { LocalStorage } from 'quasar';
import PhotoService from 'src/services/photo-service';
import { notify } from 'src/utils/helper';
import { albumStore } from 'stores/album-store';

export interface PhotoStoreState {
  photoList: Photo[];
  fetchingPhotos: boolean;
}

const photoService = new PhotoService();

const initialState: PhotoStoreState = {
  photoList: [],
  fetchingPhotos: false,
};

export const photoStore = defineStore('photos', {
  state: () => initialState,

  getters: {
    findPhotoIndex:
      (state: PhotoStoreState) =>
      (photoId: string): number => {
        const useAlbumStore = albumStore();

        return state.photoList.findIndex((photo) => photo.key === `${useAlbumStore.selectedAlbumItem.id}/${photoId}`);
      },

    findPhotoByIndex:
      (state: PhotoStoreState) =>
      (index: number): Photo | undefined =>
        state.photoList[index],
  },

  actions: {
    async getPhotos(albumId: string, refreshPhotosList?: boolean) {
      const useAlbumStore = albumStore();
      const albumItem = useAlbumStore.getAlbumById(albumId);
      if (albumItem?.id) {
        // Only fetch photos when album id is updated
        if (albumId !== useAlbumStore.selectedAlbumItem.id || refreshPhotosList) {
          useAlbumStore.selectedAlbumItem = albumItem;

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
            setTimeout(() => window.location.assign('/'), 3000);
          }
        }
      } else {
        notify('negative', "Album doesn't exist. You will be redirected to the home page in 3 seconds", true);
        setTimeout(() => window.location.assign('/'), 3000);
      }
    },
  },
});
