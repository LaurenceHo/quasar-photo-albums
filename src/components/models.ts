import { ExifTags, FileTags } from 'exifreader';

export interface Album {
  id: string;
  albumName: string;
  albumCover?: string;
  description?: string;
  isPrivate: boolean;
  tags: string[];
  order: number;
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

export interface ResponseStatus {
  code?: number;
  status: string;
  message?: string;
  data?: any;
}

export interface ApiResponse<T> extends ResponseStatus {
  data?: T;
}

export type ExifData = ExifTags & FileTags;
