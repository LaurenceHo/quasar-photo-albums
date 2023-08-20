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

export interface ResponseStatus {
  status: string;
  message?: string;
}

export type ExifData = ExifTags & FileTags;
