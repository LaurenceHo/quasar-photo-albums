import HttpRequestService from 'src/services/http-request-service';

export default class PhotoService extends HttpRequestService {
  constructor() {
    super();
    this.baseUrl =
      process.env.NODE_ENV === 'production'
        ? (process.env.GOOGLE_CLOUD_FUNCTION_URL as string) + '/api/photos'
        : `http://localhost:5001/${process.env.GOOGLE_FIREBASE_PROJECT_ID}/us-central1/main/api/photos`;
  }

  uploadPhotos(file: any, albumId: string): Promise<any> {
    this.setDisplayLoadingBar(true);
    return this.perform('POST', `/upload/${albumId}`, null, null, { file });
  }
}
