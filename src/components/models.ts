export interface Album {
  albumName: string;
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
