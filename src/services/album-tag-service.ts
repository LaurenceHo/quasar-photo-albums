import { AlbumTag, ApiResponse, ResponseStatus } from 'src/components/models';
import HttpRequestService from 'src/services/http-request-service';

export default class AlbumTagService extends HttpRequestService {
  constructor() {
    super();
    this.baseUrl = this.baseUrl + '/albumTags';
  }

  getAlbumTags(): Promise<ApiResponse<AlbumTag[]>> {
    this.setDisplayingParameters(false, undefined, true, 'Ooops, can not get album categories, please try again later');
    return this.perform('GET', '');
  }

  createAlbumTags(tags: AlbumTag[]): Promise<ResponseStatus<AlbumTag[]>> {
    this.setDisplayingParameters(true, 'Tag created');
    return this.perform('POST', '', tags);
  }

  deleteAlbumTag(tagId: string): Promise<ResponseStatus<undefined>> {
    this.setDisplayingParameters(true, 'Tag deleted');
    return this.perform('DELETE', `/${tagId}`);
  }
}
