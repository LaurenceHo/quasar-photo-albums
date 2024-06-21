declare namespace google {
  let accounts: {
    id: any;
  };
}

declare namespace NodeJS {
  interface ProcessEnv {
    readonly ALBUM_APP_TITLE: string;
    readonly AWS_API_GATEWAY_URL: string;
    readonly GOOGLE_CLIENT_ID: string;
    readonly IMAGEKIT_CDN_URL: string;
    readonly MAP_CENTRE_LAT: string;
    readonly MAP_CENTRE_LNG: string;
    readonly MAPBOX_API_KEY: string;
    readonly MODE: string;
    readonly SERVER: string;
    readonly STATIC_FILES_URL: string;
  }
}
