export interface Album {
  id: string;
  albumName: string;
  albumCover: string;
  desc: string;
  tags: string[];
  private: boolean;
}

export interface Photo {
  url: string;
  key: string;
}

export interface AlbumTag {
  id?: string;
  tag: string;
}

export interface LightBoxImage {
  name: string;
  alt?: string;
  filter?: string;
}
