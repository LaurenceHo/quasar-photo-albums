import { ApiResponse, Photo, ResponseStatus } from 'components/models';
import HttpRequestService from 'src/services/http-request-service';

export default class PhotoService extends HttpRequestService {
  constructor() {
    super();
    this.baseUrl = this.baseUrl + '/photos';
  }

  getPhotosByAlbumId(albumId: string): Promise<ApiResponse<Photo[]>> {
    this.setDisplayingParameters(true);
    return this.perform('GET', `/${albumId}`);
  }

  uploadPhotos(file: any, albumId: string): Promise<ResponseStatus> {
    this.setDisplayingParameters(true);
    return this.perform('POST', `/upload/${albumId}`, null, null, { file });
  }

  movePhotos(albumId: string, destinationAlbumId: string, photoKeys: string[]): Promise<ResponseStatus> {
    this.setDisplayingParameters(true, 'Photos moved');
    return this.perform('PUT', '', { albumId, destinationAlbumId, photoKeys });
  }

  deletePhotos(albumId: string, photoKeys: string[]): Promise<ResponseStatus> {
    this.setDisplayingParameters(true, 'Photos deleted');
    return this.perform('DELETE', '', { albumId, photoKeys });
  }
}
