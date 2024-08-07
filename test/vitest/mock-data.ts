import { vi } from 'vitest';
import { Album } from 'src/types/album';

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
    id: 'sport',
    albumName: 'Sport',
    description: 'Sport desc',
    tags: ['sport'],
    isPrivate: false,
    albumCover: 'thisIsAlbumCover/aaa.jpg',
    year: '2024',
  },
  {
    year: '2024',
    id: 'food',
    albumName: 'Food title',
    description: 'Food desc',
    tags: ['food', 'test'],
    isPrivate: false,
  },
  { year: '2024', id: 'hiking', albumName: 'Hiking', description: 'Hiking desc', tags: ['hiking'], isPrivate: false },
  { year: '2024', id: 'shoes', albumName: 'Shoes', description: 'Shoes desc', tags: [], isPrivate: false },
  {
    year: '2024',
    id: 'do-something-secret',
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
  {
    albumCover: 'album6/aaa.jpg',
    isPrivate: false,
    albumName: '6-album-6',
    description: '',
    id: 'album6',
    tags: [],
    year: '2024',
  },
  {
    albumCover: 'album1/aaa.jpg',
    isPrivate: false,
    albumName: 'album1',
    description: '',
    id: 'album1',
    tags: [],
    year: '2024',
  },
  {
    albumCover: 'album2/bbb.jpg',
    isPrivate: false,
    albumName: 'album2',
    description: '',
    id: 'album2',
    tags: [],
    year: '2024',
  },
  {
    albumCover: 'album3/ccc.jpg',
    isPrivate: false,
    albumName: 'album3',
    description: 'description',
    id: 'album3',
    tags: ['tag1', 'tag2', 'tag3'],
    year: '2024',
  },
  {
    albumCover: 'album4/ccc.jpg',
    isPrivate: false,
    albumName: 'album4',
    description: 'description',
    id: 'album4',
    tags: ['tag1', 'tag2'],
    year: '2024',
  },
  {
    albumCover: 'album5/aaa.jpg',
    isPrivate: false,
    albumName: 'album5',
    description: 'description',
    id: 'album5',
    tags: ['tag1'],
    year: '2024',
  },
];

export const mockAlbum = mockAlbumList[0] as Album;

export const mockGetAlbumsResponse = {
  code: 200,
  status: 'Success',
  message: 'ok',
  data: mockAlbumList,
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
    url: 'https://example.com/sport/photo1.jpg',
    key: 'sport/photo1.jpg',
  },
  {
    url: 'https://example.com/sport/photo2.jpg',
    key: 'sport/photo2.jpg',
  },
  {
    url: 'https://example.com/sport/photo3.jpg',
    key: 'sport/photo3.jpg',
  },
  {
    url: 'https://example.com/sport/cover.jpg',
    key: 'sport/cover.jpg',
  },
];
