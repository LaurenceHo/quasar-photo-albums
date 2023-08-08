export interface Album {
  id: string;
  albumName: string;
  albumCover?: string;
  description?: string;
  isPrivate: boolean;
  tags: string[];
}

export interface Photo {
  url: string;
  key: string;
}

export interface AlbumTag {
  id?: string;
  tag: string;
}
