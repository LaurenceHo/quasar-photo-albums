import HttpRequestService from 'src/services/http-request-service';
import { UserPermission } from 'components/models';

export default class AuthService extends HttpRequestService {
  constructor() {
    super();
    this.baseUrl = this.baseUrl + '/auth';
  }

  verifyIdToken(token: string): Promise<UserPermission> {
    this.setDisplayingParameters(true);
    return this.perform('POST', '/verifyIdToken', { token });
  }

  getUserInfo(): Promise<UserPermission> {
    this.setDisplayingParameters(false);
    return this.perform('GET', '/userInfo');
  }

  logout(): Promise<void> {
    this.setDisplayingParameters(true);
    return this.perform('POST', '/logout');
  }
}
