import { getAlbumWithLocation, getCountAlbumsByYear, getFeaturedAlbums } from '@/mocks/aggregate-handler';
import { deleteAlbum, getAlbumsByYear } from '@/mocks/album-handler';
import { createAlbumTag, deleteAlbumTag, getAlbumTags } from '@/mocks/album-tag-handler';
import { getUserPermission, userLogin, userLogout } from '@/mocks/auth-handler';
import { getPhotos } from '@/mocks/photos-handler';
import { http, passthrough } from 'msw';

const imageCDNUrl = import.meta.env.VITE_IMAGEKIT_CDN_URL;
const staticFilesUrl = import.meta.env.VITE_STATIC_FILES_URL;

export const handlers = [
  http.get(`${imageCDNUrl}/**`, () => {
    return passthrough();
  }),
  http.get(`${staticFilesUrl}/**`, () => {
    return passthrough();
  }),
  getUserPermission,
  userLogout,
  userLogin,
  getAlbumsByYear,
  deleteAlbum,
  getAlbumTags,
  createAlbumTag,
  deleteAlbumTag,
  getFeaturedAlbums,
  getCountAlbumsByYear,
  getAlbumWithLocation,
  getPhotos
];
