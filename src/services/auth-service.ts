import HttpRequestService from 'src/services/http-request-service';

export default class AuthService extends HttpRequestService {
  constructor() {
    super();
    this.baseUrl = (process.env.GOOGLE_CLOUD_FUNCTION_URL as string) + '/api/auth';
    // this.baseUrl = `http://localhost:5001/${process.env.GOOGLE_FIREBASE_PROJECT_ID}/us-central1/api/auth`;
  }

  verifyIdToken(token: string): Promise<any> {
    this.setDisplayLoadingBar(true);
    return this.perform('POST', '/verifyIdToken', { token });
  }

  checkUser(): Promise<any> {
    this.setDisplayLoadingBar(false);
    return this.perform('POST', '/checkUser');
  }
}
