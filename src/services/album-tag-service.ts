import { AlbumTag, ApiResponse, ResponseStatus } from 'src/components/models';
import HttpRequestService from 'src/services/http-request-service';

export default class AlbumTagService extends HttpRequestService {
  constructor() {
    super();
    this.baseUrl = this.baseUrl + '/albumTags';
  }

  getAlbumTags(): Promise<ApiResponse<AlbumTag[]>> {
    this.setDisplayingParameters(false);
    return this.perform('GET', '');
  }

  createAlbumTag(tag: AlbumTag): Promise<ResponseStatus> {
    this.setDisplayingParameters(true, `Tag "${tag.tag}" created`);
    return this.perform('POST', '', tag);
  }

  deleteAlbumTag(tagId: string): Promise<ResponseStatus> {
    this.setDisplayingParameters(true, 'Tag deleted');
    return this.perform('DELETE', `/${tagId}`);
  }
}
