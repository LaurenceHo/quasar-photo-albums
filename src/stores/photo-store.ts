import { Album, Photo } from 'src/types';
import { defineStore } from 'pinia';
import { LocalStorage } from 'quasar';
import PhotoService from 'src/services/photo-service';
import { albumStore, FILTERED_ALBUMS_BY_YEAR } from 'stores/album-store';

export interface PhotoStoreState {
  photoList: Photo[];
  fetchingPhotos: boolean;
}

const photoService = new PhotoService();

const initialState: PhotoStoreState = {
  photoList: [],
  fetchingPhotos: true,
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
    async getPhotos(albumId: string, albumYear: string, refreshPhotosList?: boolean) {
      const useAlbumStore = albumStore();
      // Only fetch photos when album id is updated
      if (albumId !== useAlbumStore.selectedAlbumItem.id || refreshPhotosList) {
        this.fetchingPhotos = true;

        if (!refreshPhotosList) {
          this.photoList = [];
        }

        const { data, code } = await photoService.getPhotosByAlbumId(albumId, albumYear);

        useAlbumStore.selectedAlbumItem =
          data?.album ??
          ({
            year: 'na',
            id: '',
            albumName: '',
            albumCover: '',
            description: '',
            tags: [],
            isPrivate: false,
          } as Album);
        this.photoList = data?.photos ?? [];
        this.fetchingPhotos = false;

        if (code && code !== 200) {
          if (code === 401 || code === 403) {
            // Temporarily set selected album id to the album id from URL to avoid re-fetching photos
            useAlbumStore.selectedAlbumItem.id = albumId;
            LocalStorage.remove(FILTERED_ALBUMS_BY_YEAR);
          }
          setTimeout(() => window.location.assign('/'), 3000);
        }
      }
    },
  },
});
