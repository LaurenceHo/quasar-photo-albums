import { Album, Photo } from 'components/models';
import { defineStore } from 'pinia';
import { LocalStorage, Notify } from 'quasar';
import PhotoService from 'src/services/photo-service';
import { albumStore } from 'stores/album-store';
import { useRouter } from 'vue-router';

export interface PhotoStoreState {
  selectedAlbumItem: Album;
  photoList: Photo[];
  selectedImageIndex: number;
}

const photoService = new PhotoService();

export const photoStore = defineStore('photos', {
  state: () =>
    ({
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
      selectedImageIndex: -1,
    }) as PhotoStoreState,

  getters: {
    findPhotoIndex: (state: PhotoStoreState) => (photoId: string) =>
      state.photoList.findIndex((photo) => photo.key === `${state.selectedAlbumItem.id}/${photoId}`),
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
          const { data, code } = await photoService.getPhotosByAlbumId(albumId);
          this.photoList = data ?? [];
          if (code && code !== 200) {
            if (code > 400 && code < 500) {
              LocalStorage.remove('ALL_ALBUMS');
              await useAlbumStore.getAllAlbumInformation();
            }

            Notify.create({
              timeout: 2000,
              progress: true,
              color: 'negative',
              icon: 'mdi-alert-circle',
              message: 'Ooops, something wrong. You will be redirected to the home page in 3 seconds',
            });
            setTimeout(() => window.location.assign('/'), 3000);
          }
        }
      } else {
        Notify.create({
          timeout: 2000,
          progress: true,
          color: 'negative',
          icon: 'mdi-alert-circle',
          message: "Album doesn't exist. You will be redirected to the home page in 3 seconds",
        });
        setTimeout(() => window.location.assign('/'), 3000);
      }
    },
  },
});
