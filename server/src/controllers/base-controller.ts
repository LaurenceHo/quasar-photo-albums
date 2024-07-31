import { FastifyReply, RouteHandler } from 'fastify';
import { BaseController as IBaseController } from '../types/models.js';
import JsonResponse from '../utils/json-response.js';

export abstract class BaseController implements IBaseController {
  abstract findAll: RouteHandler;

  abstract findOne: RouteHandler;

  abstract create: RouteHandler;

  abstract update: RouteHandler;

  abstract delete: RouteHandler;

  public ok<T>(reply: FastifyReply, message = '', data?: T) {
    if (data) {
      return new JsonResponse<T>(200).success(reply, message, data);
    } else {
      return new JsonResponse(200).success(reply, message);
    }
  }

  public clientError(reply: FastifyReply, message = '') {
    return new JsonResponse(400).badRequest(reply, message);
  }

  public notFoundError(reply: FastifyReply, message = '') {
    return new JsonResponse(404).badRequest(reply, message);
  }

  public unauthorized(reply: FastifyReply, message = '') {
    return new JsonResponse(401).unauthorized(reply, message);
  }

  public insufficientPermission(reply: FastifyReply, message = '') {
    return new JsonResponse(403).unauthorized(reply, message);
  }

  public fail(reply: FastifyReply, message: string) {
    return new JsonResponse(500).error(reply, message);
  }
}
