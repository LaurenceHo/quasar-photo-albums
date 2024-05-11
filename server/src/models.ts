import { FastifyRequest, RouteHandler } from 'fastify';
import { Album } from './schemas/album';
import { UserPermission } from './schemas/user-permission.js';

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

export interface Photo {
  url: string;
  key: string;
  size?: number;
  lastModified?: Date;
}

export interface Place {
  displayName: string;
  formattedAddress: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

export interface PhotoResponse {
  photos: Photo[];
  album: Album;
}

export interface PhotosRequest {
  albumId: string;
  destinationAlbumId?: string;
  photoKeys: string[];
}

export interface RenamePhotoRequest {
  albumId: string;
  newPhotoKey: string;
  currentPhotoKey: string;
}

export interface ResponseStatus {
  code?: number;
  status: string;
  message?: string;
  data?: any;
}

export interface ApiResponse<T> extends ResponseStatus {
  data?: T;
}
