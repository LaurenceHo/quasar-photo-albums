import { Album, ResponseStatus } from 'src/components/models';
import HttpRequestService from 'src/services/http-request-service';

export default class AlbumService extends HttpRequestService {
  constructor() {
    super();
    this.baseUrl = this.baseUrl + '/albums';
  }

  public getAlbums(sort?: string, startIndex?: number, endIndex?: number, filter?: string): Promise<Album[]> {
    // TODO: May need to apply filter in the feature. It only runs filter in the memory atm.
    this.setDisplayingParameters(false);
    return this.perform('GET', '');
  }

  public createAlbum(album: Album): Promise<ResponseStatus> {
    this.setDisplayingParameters(true, `Album "${album.albumName}" created`);
    return this.perform('POST', '', album);
  }

  public updateAlbum(album: Album): Promise<ResponseStatus> {
    this.setDisplayingParameters(true, `Album "${album.albumName}" updated`);
    return this.perform('PUT', '', album);
  }

  public deleteAlbum(albumId: string): Promise<ResponseStatus> {
    this.setDisplayingParameters(true, 'Album deleted');
    return this.perform('DELETE', `/${albumId}`);
  }
}
