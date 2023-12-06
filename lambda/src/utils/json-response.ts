import { Response } from 'express';
import { ApiResponse, ResponseStatus } from '../models';
import { STATUS_ERROR, STATUS_SUCCESS, STATUS_UNAUTHORIZED } from '../constants';

export default class JsonResponse<T> {
  private readonly code: number;
  private _status: string;

  constructor(statusCode = 200) {
    this.code = statusCode;
    this._status = '';
  }

  unauthorized = (res: Response, message: string) => {
    this._status = STATUS_UNAUTHORIZED;
    return res.status(this.code).json({
      code: this.code,
      status: this._status,
      message,
    } as ResponseStatus);
  };

  error = (res: Response, message: string) => {
    this._status = STATUS_ERROR;
    return res.status(this.code).json({
      code: this.code,
      status: this._status,
      message,
    } as ResponseStatus);
  };

  success = (res: Response, message: string, data?: T) => {
    this._status = STATUS_SUCCESS;
    if (!!data) {
      return res.status(this.code).json({
        code: this.code,
        status: this._status,
        message,
        data,
      } as ApiResponse<T>);
    } else {
      return res.status(this.code).json({
        code: this.code,
        status: this._status,
        message,
      } as ResponseStatus);
    }
  };

  setStatus(status: string) {
    this._status = status;
    return this;
  }
}
