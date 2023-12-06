import { Response, RequestHandler } from 'express';
import { BaseController as IBaseController } from '../models';
import JsonResponse from '../utils/json-response';

export abstract class BaseController implements IBaseController {
  abstract findAll: RequestHandler;

  abstract findOne: RequestHandler;

  abstract create: RequestHandler;

  abstract update: RequestHandler;

  abstract delete: RequestHandler;

  public ok<T>(res: Response, message = '', data?: T) {
    if (!!data) {
      return new JsonResponse<T>().success(res, message, data);
    } else {
      return new JsonResponse().success(res, message);
    }
  }

  public fail(res: Response, message: string) {
    return new JsonResponse(500).error(res, message);
  }

  public unauthorized(res: Response, message = '') {
    return new JsonResponse(401).unauthorized(res, message);
  }

  public clientError(res: Response, message = '') {
    return new JsonResponse(400).error(res, message);
  }
}
