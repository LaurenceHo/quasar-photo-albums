export interface AlbumV2 {
  id: string;
  albumName: string;
  albumCover?: string;
  description: string;
  tags: string[];
  isPrivate: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface PhotoObject {
  albumId: string;
  objectKeys: string[];
}

export interface ResponseStatus {
  status: string;
  message?: string;
}
