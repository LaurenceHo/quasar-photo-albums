import { Notify } from 'quasar';

export default class AuthService {
  CLOUD_FUNCTION_URL = process.env.GOOGLE_CLOUD_FUNCTION_URL;

  private static async checkStatus(response: Response) {
    if (response.status >= 200 && response.status < 300) {
      return response;
    } else {
      Notify.create({
        color: 'negative',
        icon: 'mdi-alert-circle-outline',
        message: `Error! ${response.statusText}`,
      });

      let errorJson: any = null;
      try {
        errorJson = await response.json();
      } catch (error) {
        throw new Error(response.statusText);
      }
      if (errorJson.error) {
        throw new Error(errorJson.error);
      } else {
        throw new Error(response.statusText);
      }
    }
  }

  verifyIdToken(token: string): Promise<any> {
    return fetch(`${this.CLOUD_FUNCTION_URL}/verifyIdToken?token=${token}`)
      .then(AuthService.checkStatus)
      .then(this.parseJSON);
  }

  private parseJSON(response: Response) {
    return response
      .json()
      .then((data) => data)
      .catch(() => response);
  }
}
