import { Album, AlbumTag } from 'src/components/models';
import HttpRequestService from 'src/services/http-request-service';

export default class AlbumService extends HttpRequestService {
  constructor() {
    super();
    this.baseUrl =
      process.env.NODE_ENV === 'production'
        ? (process.env.GOOGLE_CLOUD_FUNCTION_URL as string) + '/api/albums'
        : `http://localhost:5001/${process.env.GOOGLE_FIREBASE_PROJECT_ID}/us-central1/main/api/albums`;
  }

  getAlbums(startIndex?: number, endIndex?: number, filter?: string): Promise<Album[]> {
    // TODO: May need to apply filter in the feature. It only runs filter in the memory atm.
    this.setDisplayLoadingBar(false);
    return this.perform('GET', '');
  }

  getAlbumTags(): Promise<AlbumTag[]> {
    this.setDisplayLoadingBar(false);
    return this.perform('GET', '/tags');
  }

  createAlbum(album: Album): Promise<any> {
    this.setDisplayLoadingBar(true);
    return this.perform('POST', '', album);
  }

  updateAlbum(album: Album): Promise<any> {
    this.setDisplayLoadingBar(true);
    return this.perform('PUT', '', album);
  }

  deleteAlbum(albumId: string): Promise<any> {
    this.setDisplayLoadingBar(true);
    return this.perform('DELETE', `/${albumId}`);
  }
}
