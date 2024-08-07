import HttpRequestService from 'src/services/http-request-service';
import { AggregateType, ApiResponse, DataAggregateValueMap } from 'src/types';

export default class AggregateService extends HttpRequestService<DataAggregateValueMap[AggregateType]> {
  constructor() {
    super();
    this.baseUrl = this.baseUrl + '/aggregate';
  }

  public getAggregateData(type: AggregateType): Promise<ApiResponse<DataAggregateValueMap[typeof type]>> {
    this.setDisplayingParameters(
      type === 'albumsWithLocation',
      undefined,
      true,
      'Ooops, something went wrong, please try again later'
    );
    return this.perform('GET', `/${type}`);
  }
}
