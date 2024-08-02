import HttpRequestService from 'src/services/http-request-service';
import { ApiResponse, Place } from 'src/types';

export default class LocationService extends HttpRequestService<Place[]> {
  constructor() {
    super();
    this.baseUrl = this.baseUrl + '/location';
  }

  public searchPlaces(text: string): Promise<ApiResponse<Place[]>> {
    this.setDisplayingParameters(false);
    return this.perform('GET', `/search?textQuery=${text}`);
  }
}
