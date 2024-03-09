import { Request, RequestHandler } from 'express';

export type RequestWithUser = Request & { user: UserPermission | null };

export interface Read<T> {
  findAll?(param: any): Promise<T[]>;
  findOne?(param: any): Promise<T>;
}

export interface Write {
  create?(param: any): Promise<boolean>;
  update?(param: any): Promise<boolean>;
  delete?(param: any): Promise<boolean>;
}

export type BaseService<T> = Read<T> & Write;

export interface BaseController {
  findAll?: RequestHandler;

  findOne?: RequestHandler;

  create?: RequestHandler;

  update?: RequestHandler;

  delete?: RequestHandler;
}

export interface Album {
  id: string; // it is the same as the folder name in s3
  albumName: string;
  albumCover?: string;
  description?: string;
  tags?: string[];
  isPrivate: boolean;
  order: number;
  place?: Place;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface Photo {
  url: string;
  key: string;
}

export interface AlbumTag {
  tag: string;
}

export interface UserPermission {
  uid: string;
  email: string;
  role: string;
  displayName: string;
}

export interface Place {
  displayName: string;
  formattedAddress: string;
  location: {
    latitude: number;
    longitude: number;
  };
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
