export interface Album {
  id: string;
  albumName: string;
  desc: string;
  tags: string[];
  private: boolean;
}

export interface Photo {
  url: string;
  key?: string;
}

export interface AlbumTag {
  tag: string;
}

export interface LightBoxImage {
  name: string;
  alt?: string;
  filter?: string;
}
