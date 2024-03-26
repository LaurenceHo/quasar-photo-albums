import { vi } from 'vitest';
import { Album } from '../../../src/components/models';

export const mockFetch = () => {
  const mockFetchPromise = Promise.resolve({
    status: 200,
    json: () => Promise.resolve(),
    headers: {
      get: vi.fn(),
    },
  });
  const globalRef: any = global;
  globalRef.fetch = vi.fn().mockImplementation(() => mockFetchPromise);
};

export const mockAlbumTagList = [{ tag: 'sport' }, { tag: 'food' }, { tag: 'hiking' }];
export const mockAlbumList: Album[] = [
  {
    id: 'Sport',
    albumName: 'Sport',
    description: 'Sport',
    tags: ['sport'],
    isPrivate: false,
  },
  { id: 'Food', albumName: 'Food title', description: 'Food desc', tags: ['food', 'test'], isPrivate: false },
  { id: 'Hiking', albumName: 'Hiking', description: 'Hiking', tags: ['hiking'], isPrivate: false },
  { id: 'Shoes', albumName: 'Shoes', description: 'Shoes', tags: [], isPrivate: false },
  {
    id: 'Do something secret',
    albumName: 'Do something secret',
    description: 'Do something secret',
    tags: ['secret'],
    isPrivate: true,
    place: {
      displayName: 'secret place',
      formattedAddress: 'secret place',
      location: {
        latitude: 80,
        longitude: 80,
      },
    },
  },
];

export const mockAlbum = {
  id: 'Sport',
  albumName: 'Sport',
  desc: 'Sport',
  tags: ['sport'],
  private: false,
  albumCover: 'thisIsAlbumCover',
};

export const mockGetAlbumsResponse = {
  code: 200,
  status: 'Success',
  message: 'ok',
  data: [
    {
      albumCover: 'album6/aaa.jpg',
      isPrivate: false,
      order: 141,
      albumName: '6-album-6',
      description: '',
      id: 'album1',
      tags: [],
    },
    {
      albumCover: 'album1/aaa.jpg',
      isPrivate: false,
      order: 141,
      albumName: 'album1',
      description: '',
      id: 'album1',
      tags: [],
    },
    {
      albumCover: 'album2/bbb.jpg',
      isPrivate: false,
      order: 254,
      albumName: 'album2',
      description: '',
      id: 'album2',
      tags: [],
    },
    {
      albumCover: 'album3/ccc.jpg',
      isPrivate: false,
      order: 416,
      albumName: 'album3',
      description: 'description',
      id: 'album3',
      tags: ['tag1', 'tag2', 'tag3'],
    },
    {
      albumCover: 'album4/ccc.jpg',
      isPrivate: false,
      order: 415,
      albumName: 'album4',
      description: 'description',
      id: 'album4',
      tags: ['tag1', 'tag2'],
    },
    {
      albumCover: 'album5/aaa.jpg',
      isPrivate: false,
      order: 213,
      albumName: 'album5',
      description: 'description',
      id: 'album5',
      tags: ['tag1'],
    },
  ],
};

export const mockGetAlbumTagsResponse = {
  code: 200,
  status: 'Success',
  message: 'ok',
  data: [
    {
      tag: 'tag1',
    },
    {
      tag: 'tag2',
    },
    {
      tag: 'tag3',
    },
    {
      tag: 'tag4',
    },
  ],
};

export const mockGetUserPermissionResponse = { code: 401, status: 'Unauthorized', message: 'User is not logged-in' };

export const mockPhotoList = [
  {
    url: 'https://example.com/album1/photo1.jpg',
    key: 'album-1/photo1.jpg',
  },
  {
    url: 'https://example.com/album1/photo2.jpg',
    key: 'album-1/photo2.jpg',
  },
  {
    url: 'https://example.com/album1/photo3.jpg',
    key: 'album-1/photo3.jpg',
  },
  {
    url: 'https://example.com/album1/photo3.jpg',
    key: 'album-1/cover.jpg',
  },
];
