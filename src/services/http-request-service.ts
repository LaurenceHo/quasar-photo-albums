import isEmpty from 'lodash/isEmpty';
import { LoadingBar } from 'quasar';

export default class HttpRequestService {
  baseUrl = '';
  displayLoadingBar = false;

  public setDisplayLoadingBar(displayLoadingBar: boolean) {
    this.displayLoadingBar = displayLoadingBar;
  }

  /**
   * Perform API request
   * @param method
   * @param urlPath
   * @param requestJsonBody, must be a JSON payload
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

    let data = {};
    const response = await fetch(urlPath, requestOptions);

    if (response.status >= 200 && response.status < 300) {
      const contentLength = response.headers.get('content-length');
      let contentLengthInt = 0;
      if (contentLength) {
        contentLengthInt = parseInt(contentLength);
      }

      if (contentLengthInt > 0 || !contentLength) {
        data = await this.parseResponse(response);
      }
    } else {
      await this.errorHandling(response);
    }
    LoadingBar.stop();
    return data;
  }

  private errorHandling = async (response: Response) => {
    // For 403, 404 or 500...etc error
    let errorJson: { status: string; message: string } = { status: '', message: '' };
    try {
      errorJson = await response.json();
    } catch (error) {
      throw new Error(response.statusText);
    }
    if (errorJson.message) {
      throw new Error(errorJson.message);
    } else {
      throw new Error(errorJson.status || response.statusText);
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
