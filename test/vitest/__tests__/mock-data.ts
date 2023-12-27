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
