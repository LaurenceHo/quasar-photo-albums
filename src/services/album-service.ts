import HttpRequestService from 'src/services/http-request-service';
import { Album, ApiResponse, ResponseStatus } from 'src/types';

export default class AlbumService extends HttpRequestService {
  constructor() {
    super();
    this.baseUrl = this.baseUrl + '/albums';
  }

  public getAlbumsByYear(year = 'na'): Promise<ApiResponse<Album[]>> {
    this.setDisplayingParameters(false, undefined, true, 'Ooops, can not get albums, please try again later');
    return this.perform('GET', `/${year}`);
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
