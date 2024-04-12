import { RequestHandler, Response } from 'express';
import { FastifyReply, RouteHandler } from 'fastify';
import { BaseController as IBaseController, BaseControllerV2 as IBaseControllerV2 } from '../models.js';
import JsonResponse from '../utils/json-response.js';
import JsonResponseV2 from '../utils/json-response-v2.js';

export abstract class BaseController implements IBaseController {
  abstract findAll: RequestHandler;

  abstract findOne: RequestHandler;

  abstract create: RequestHandler;

  abstract update: RequestHandler;

  abstract delete: RequestHandler;

  public ok<T>(res: Response, message = '', data?: T) {
    if (data) {
      return new JsonResponse<T>(200).success(res, message, data);
    } else {
      return new JsonResponse(200).success(res, message);
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

export abstract class BaseControllerV2 implements IBaseControllerV2 {
  abstract findAll: RouteHandler;

  abstract findOne: RouteHandler;

  abstract create: RouteHandler;

  abstract update: RouteHandler;

  abstract delete: RouteHandler;

  public ok<T>(reply: FastifyReply, message = '', data?: T) {
    if (data) {
      return new JsonResponseV2<T>(200).success(reply, message, data);
    } else {
      return new JsonResponseV2(200).success(reply, message);
    }
  }

  public fail(reply: FastifyReply, message: string) {
    return new JsonResponseV2(500).error(reply, message);
  }

  public unauthorized(reply: FastifyReply, message = '') {
    return new JsonResponseV2(401).unauthorized(reply, message);
  }

  public clientError(reply: FastifyReply, message = '') {
    return new JsonResponseV2(400).error(reply, message);
  }
}
