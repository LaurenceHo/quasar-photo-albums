export interface Album {
  albumName: string;
  desc: string;
  tags: string[];
}

export interface Photo {
  url: string;
  key?: string;
}

export interface LightBoxImage {
  name: string;
  alt?: string;
  filter?: string;
}
