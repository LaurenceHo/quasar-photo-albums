import { data } from 'autoprefixer';
import { Response } from 'express';
import { ResponseStatus } from '../models';
import { STATUS_ERROR, STATUS_SUCCESS } from '../constants';

export default class JsonResponse {
  private readonly statusCode: number;
  private _status: string;

  constructor(statusCode = 200) {
    this.statusCode = statusCode;
    this._status = '';
  }

  error = (res: Response, message: string) => {
    this._status = STATUS_ERROR;
    return res.status(this.statusCode).json({
      code: this.statusCode,
      status: this._status,
      message,
    } as ResponseStatus);
  };

  success = (res: Response, message: string, data: any) => {
    this._status = STATUS_SUCCESS;
    return res.status(this.statusCode).json({
      code: this.statusCode,
      status: this._status,
      message,
      data,
    } as ResponseStatus);
  };

  set status(value: string) {
    this._status = value;
  }
}
