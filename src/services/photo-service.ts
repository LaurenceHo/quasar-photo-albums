import { Photo, ResponseStatus } from 'components/models';
import HttpRequestService from 'src/services/http-request-service';

export default class PhotoService extends HttpRequestService {
  constructor() {
    super();
    this.baseUrl = this.baseUrl + '/photos';
  }

  getPhotosByAlbumId(albumId: string): Promise<Photo[]> {
    this.setDisplayingParameters(true);
    return this.perform('GET', `/${albumId}`);
  }

  uploadPhotos(file: any, albumId: string): Promise<ResponseStatus> {
    this.setDisplayingParameters(true);
    return this.perform('POST', `/upload/${albumId}`, null, null, { file });
  }

  deletePhotos(albumId: string, objectKeys: string[]): Promise<ResponseStatus> {
    this.setDisplayingParameters(true);
    return this.perform('DELETE', '/photos', { albumId, objectKeys });
  }
}
