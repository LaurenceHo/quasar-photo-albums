import { Album, ApiResponse, Place } from 'src/components/models';
import HttpRequestService from 'src/services/http-request-service';

export default class LocationService extends HttpRequestService {
  constructor() {
    super();
    this.baseUrl = this.baseUrl + '/location';
  }

  public searchPlaces(text: string): Promise<ApiResponse<Place[]>> {
    this.setDisplayingParameters(false);
    return this.perform('GET', `/search?textQuery=${text}`);
  }

  public getAlbumsWithLocation(): Promise<ApiResponse<Album[]>> {
    this.setDisplayingParameters(true);
    return this.perform('GET', '/albums');
  }
}
