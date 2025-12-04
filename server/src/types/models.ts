import { Context } from 'hono';
import { UserPermission } from './user-permission';

export type RequestWithUser = { user?: UserPermission | null };

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
  findAll?(c: Context): Promise<Response>;

  findOne?(c: Context): Promise<Response>;

  create?(c: Context): Promise<Response>;

  update?(c: Context): Promise<Response>;

  delete?(c: Context): Promise<Response>;
}
