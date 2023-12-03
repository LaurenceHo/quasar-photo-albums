import { Response } from 'express';
import { ResponseStatus } from '../models';
import { STATUS_SUCCESS } from '../constants';

export default class JsonResponse {
  private readonly statusCode: number;

  constructor(statusCode = 200) {
    this.statusCode = statusCode;
  }

  error = (res: Response, status: string, message: string) => {
    return res.status(this.statusCode).json({
      code: this.statusCode,
      status,
      message,
    } as ResponseStatus);
  };

  success = (res: Response, message: string, data: any) => {
    return res.status(this.statusCode).json({
      code: this.statusCode,
      status: STATUS_SUCCESS,
      message,
      data,
    } as ResponseStatus);
  };
}
