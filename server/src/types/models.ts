import { FastifyRequest, RouteHandler } from 'fastify';
import { UserPermission } from '../schemas/user-permission.js';

export type RequestWithUser = FastifyRequest & { user?: UserPermission | null };

export interface Read<T> {
  findAll?(param: any, filter?: any, attributes?: any, whereClause?: any): Promise<T[]>;

  findOne?(param: any): Promise<T>;
}

export interface Write<T> {
  create?(param: any): Promise<boolean | T | T[]>;

  update?(param: any, item?: T, whereClause?: any): Promise<boolean | T>;

  delete?(param: any): Promise<boolean>;
}

export type BaseService<T> = Read<T> & Write<T>;

export interface BaseController {
  findAll?: RouteHandler;

  findOne?: RouteHandler;

  create?: RouteHandler;

  update?: RouteHandler;

  delete?: RouteHandler;
}
