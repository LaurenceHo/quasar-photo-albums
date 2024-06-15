import { ExifTags, FileTags } from 'exifreader';

export interface Album {
  year: string;
  id: string;
  albumName: string;
  albumCover?: string;
  description?: string;
  isPrivate: boolean;
  isFeatured?: boolean;
  tags?: string[];
  place?: Place | null;
}

export interface Photo {
  url: string;
  key: string; // `${albumId}/${photoId}`
  size?: number;
  lastModified?: Date;
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

export interface ResponseStatus {
  code: number;
  status: string;
  message?: string;
  data?: any;
}

export interface ApiResponse<T> extends ResponseStatus {
  data?: T;
}

export type ExifData = ExifTags & FileTags;

export interface UploadableFile {
  id: string;
  file: File;
  url: string;
  status: 'loading' | boolean | null;
  exists: boolean;
}

export type AlbumsByYear = { year: string; count: number }[];

export type DataAggregateValueMap = {
  albumsWithLocation: Album[];
  countAlbumsByYear: AlbumsByYear;
  featuredAlbums: Album[];
};

export interface DataAggregation<K extends keyof DataAggregateValueMap> {
  key: K;
  value: DataAggregateValueMap[K];
}
