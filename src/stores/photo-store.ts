import { Album, Photo } from 'components/models';
import { defineStore } from 'pinia';
import { Notify } from 'quasar';
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
        desc: '',
        tags: [],
        private: false,
      },
      photoList: [],
      selectedImageIndex: -1,
    } as PhotoStoreState),

  getters: {
    findPhotoIndex: (state: PhotoStoreState) => (photoId: string) =>
      state.photoList.findIndex((photo) => photo.key === `${state.selectedAlbumItem.id}/${photoId}`),
  },

  actions: {
    async getPhotos(albumId: string, refreshPhotosList?: boolean) {
      const store = albumStore();
      const router = useRouter();
      const albumItem = store.getAlbumById(albumId) as Album;
      if (albumItem?.id) {
        // Only fetch photos when album id is updated
        if (albumId !== this.selectedAlbumItem.id || refreshPhotosList) {
          this.selectedAlbumItem = albumItem;
          if (!refreshPhotosList) {
            this.photoList = [];
          }
          this.photoList = await photoService.getPhotosByAlbumId(albumId);
        }
      } else {
        Notify.create({
          timeout: 2000,
          progress: true,
          color: 'negative',
          icon: 'mdi-alert-circle-outline',
          message: "Album doesn't exist. You will be redirected to the home page in 3 seconds",
        });
        setTimeout(() => router.push('/'), 3000);
      }
    },
  },
});
