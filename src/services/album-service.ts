import { Album, ApiResponse, ResponseStatus } from 'src/components/models';
import HttpRequestService from 'src/services/http-request-service';

export default class AlbumService extends HttpRequestService {
  constructor() {
    super();
    this.baseUrl = this.baseUrl + '/albums';
  }

  public getAlbums(filter = 'na'): Promise<ApiResponse<Album[]>> {
    if (filter === 'n/a') {
      filter = 'na';
    }
    this.setDisplayingParameters(false);
    return this.perform('GET', `/${filter}`);
  }

  public createAlbum(album: Album): Promise<ResponseStatus> {
    this.setDisplayingParameters(true, `Album "${album.albumName}" created`);
    return this.perform('POST', '', album);
  }

  public updateAlbum(album: Album): Promise<ResponseStatus> {
    this.setDisplayingParameters(true, `Album "${album.albumName}" updated`);
    return this.perform('PUT', '', album);
  }

  public deleteAlbum(albumId: string, year: string): Promise<ResponseStatus> {
    this.setDisplayingParameters(true, 'Album deleted');
    return this.perform('DELETE', '', { id: albumId, year });
  }
}
