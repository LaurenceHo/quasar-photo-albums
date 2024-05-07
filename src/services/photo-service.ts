import { ApiResponse, Photo, ResponseStatus } from 'components/models';
import HttpRequestService from 'src/services/http-request-service';

export default class PhotoService extends HttpRequestService {
  constructor() {
    super();
    this.baseUrl = this.baseUrl + '/photos';
  }

  getPhotosByAlbumId(albumId: string, year: string): Promise<ApiResponse<Photo[]>> {
    this.setDisplayingParameters(true);
    return this.perform('GET', `/${year}/${albumId}`);
  }

  uploadPhotos(file: any, albumId: string): Promise<ResponseStatus> {
    this.setDisplayingParameters(true);
    return this.perform('POST', `/upload/${albumId}`, null, null, { file });
  }

  /**
   * Move photos from one album to another
   * @param albumId Original album ID
   * @param destinationAlbumId Destination album ID
   * @param photoKeys Keys of photos to be moved
   */
  movePhotos(albumId: string, destinationAlbumId: string, photoKeys: string[]): Promise<ResponseStatus> {
    this.setDisplayingParameters(true, 'Photos moved');
    return this.perform('PUT', '', { albumId, destinationAlbumId, photoKeys });
  }

  renamePhoto(albumId: string, newPhotoKey: string, currentPhotoKey: string): Promise<ResponseStatus> {
    this.setDisplayingParameters(true, 'Photo renamed');
    return this.perform('PUT', '/rename', { albumId, newPhotoKey, currentPhotoKey });
  }

  deletePhotos(albumId: string, photoKeys: string[]): Promise<ResponseStatus> {
    this.setDisplayingParameters(true, 'Photos deleted');
    return this.perform('DELETE', '', { albumId, photoKeys });
  }
}
