import HttpRequestService from 'src/services/http-request-service';

export default class AuthService extends HttpRequestService {
  constructor() {
    super();
    this.baseUrl = (process.env.GOOGLE_CLOUD_FUNCTION_URL as string) + '/api/auth';
  }

  verifyIdToken(token: string): Promise<any> {
    this.setDisplayingParameters(true);
    return this.perform('POST', '/verifyIdToken', { token });
  }
}
