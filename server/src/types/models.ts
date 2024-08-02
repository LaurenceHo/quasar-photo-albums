import { FastifyRequest, RouteHandler } from 'fastify';
import { UserPermission } from '../schemas/user-permission.js';

export type RequestWithUser = FastifyRequest & { user?: UserPermission | null };

export interface Read<T> {
  findAll?(param: any, whereClause?: any): Promise<T[]>;
  findOne?(param: any): Promise<T>;
}

export interface Write {
  create?(param: any): Promise<boolean>;
  update?(param: any, item?: any): Promise<boolean>;
  delete?(param: any): Promise<boolean>;
}

export type BaseService<T> = Read<T> & Write;

export interface BaseController {
  findAll?: RouteHandler;

  findOne?: RouteHandler;

  create?: RouteHandler;

  update?: RouteHandler;

  delete?: RouteHandler;
}
