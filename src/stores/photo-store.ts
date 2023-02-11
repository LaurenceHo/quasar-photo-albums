import { Album, Photo } from 'components/models';
import { defineStore } from 'pinia';
import { Loading, Notify } from 'quasar';
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

  actions: {
    async getPhotos(albumId: string) {
      const store = albumStore();
      const router = useRouter();
      const albumItem = store.getAlbumById(albumId) as Album;
      if (albumItem?.id) {
        // Only fetch photos when album id is updated
        if (albumId !== this.selectedAlbumItem.id) {
          Loading.show();
          this.selectedAlbumItem = albumItem;
          this.photoList = [];
          this.photoList = await photoService.getPhotosByAlbumId(albumId);
          Loading.hide();
        }
      } else {
        Notify.create({
          timeout: 4000,
          progress: true,
          color: 'negative',
          icon: 'mdi-alert-circle-outline',
          message: "Album doesn't exist. You will be redirected to the home page in 5 seconds",
        });
        setTimeout(() => router.push('/'), 5000);
      }
    },
  },
});
