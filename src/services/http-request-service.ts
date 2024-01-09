import { isEmpty } from 'lodash-es';
import { LoadingBar, Notify } from 'quasar';

export default class HttpRequestService {
  baseUrl = process.env.NODE_ENV === 'production' ? process.env.AWS_API_GATEWAY_URL : 'http://localhost:3000/api';
  displayLoadingBar = false;
  customSuccessMessage: string | null = null;
  displayErrorNotification = true;

  /**
   * @param displayLoadingBar
   * @param customSuccessMessage
   * @param displayErrorNotification
   */
  public setDisplayingParameters(
    displayLoadingBar: boolean,
    customSuccessMessage: string | null = null,
    displayErrorNotification = true
  ) {
    this.displayLoadingBar = displayLoadingBar;
    this.customSuccessMessage = customSuccessMessage;
    this.displayErrorNotification = displayErrorNotification;
  }

  /**
   * Perform API request
   * @param method
   * @param urlPath
   * @param requestJsonBody
   * @param urlencodedParams
   * @param formParams
   */
  public async perform(
    method: string,
    urlPath: string,
    requestJsonBody?: any,
    urlencodedParams?: any,
    formParams?: any
  ): Promise<any> {
    urlPath = this.baseUrl + urlPath;

    if (this.displayLoadingBar) {
      LoadingBar.start();
    }

    const headers = new Headers({ Accept: '*/*' });

    const requestOptions: any = {};
    requestOptions.mode = 'cors';
    requestOptions.credentials = 'include';
    requestOptions.cache = 'no-cache';

    // Construct request body
    if (!isEmpty(requestJsonBody)) {
      // JSON content
      headers.append('Content-Type', 'application/json');
      requestOptions.body = JSON.stringify(requestJsonBody);
    } else if (!isEmpty(urlencodedParams)) {
      headers.append('Content-Type', 'application/x-www-form-urlencoded');
      const urlSearchParams = new URLSearchParams();
      for (const param of Object.keys(urlencodedParams)) {
        urlSearchParams.append(param, urlencodedParams[param]);
      }
      requestOptions.body = urlSearchParams;
    } else if (!isEmpty(formParams)) {
      const formData = new FormData();
      for (const formParam of Object.keys(formParams)) {
        formData.append(formParam, formParams[formParam]);
      }
      requestOptions.body = formData;
    }

    requestOptions.method = method.toUpperCase();
    requestOptions.headers = headers;

    let data = {} as any;
    const response = await fetch(urlPath, requestOptions);
    if (response.status >= 200 && response.status < 300) {
      if (this.customSuccessMessage) {
        this.notifyMessage(false, this.customSuccessMessage);
      }

      const contentLength = response.headers.get('content-length');
      let contentLengthInt = 0;
      if (contentLength) {
        contentLengthInt = parseInt(contentLength);
      }

      if (contentLengthInt > 0 || !contentLength) {
        data = await this.parseResponse(response);
      }
    } else {
      data = await this.errorHandling(response);
    }
    LoadingBar.stop();
    return data;
  }

  notifyMessage = (error: boolean, message: string) => {
    Notify.create({
      color: error ? 'negative' : 'positive',
      textColor: 'white',
      icon: error ? 'mdi-alert-circle-outline' : 'mdi-check-circle-outline',
      message: message,
    });
  };

  private errorHandling = async (response: Response) => {
    // Catch error and handle it here. Don't throw it to UI.
    let errorJson: { status: string; message: string } = { status: '', message: '' };
    try {
      errorJson = await response.json();
      // If we can parse error response to JSON, display error message from JSON
      if (this.displayErrorNotification) {
        this.notifyMessage(true, errorJson.message || errorJson.status || response.statusText);
      }
      return errorJson;
    } catch (error) {
      // If we cannot parse error response to JSON (exception will occur),
      // display original response status text as warning message
      if (this.displayErrorNotification) {
        this.notifyMessage(true, `Error: ${response.statusText}`);
      }
    } finally {
      LoadingBar.stop();
    }
  };

  private parseResponse = (response: Response) => {
    return response
      .json()
      .then((data) => data)
      .catch(() => {
        return response
          .text()
          .then((data) => data)
          .catch(() => {
            return {};
          });
      });
  };
}
