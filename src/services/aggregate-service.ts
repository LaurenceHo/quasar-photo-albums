import { ApiResponse, DataAggregateValueMap } from 'src/components/models';
import HttpRequestService from 'src/services/http-request-service';

export default class AggregateService extends HttpRequestService {
  constructor() {
    super();
    this.baseUrl = this.baseUrl + '/aggregate';
  }

  public getAggregateData(
    type: 'albumsWithLocation' | 'countAlbumsByYear' | 'featuredAlbums'
  ): Promise<ApiResponse<DataAggregateValueMap[typeof type]>> {
    this.setDisplayingParameters(false);
    return this.perform('GET', `/${type}`);
  }
}
