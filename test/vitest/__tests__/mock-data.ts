import { vi } from 'vitest';

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

export const mockAlbumList = [
  { id: 'Sport', albumName: 'Sport', desc: 'Sport', tags: ['sport'], private: false },
  { id: 'Food', albumName: 'Food title', desc: 'Food desc', tags: ['food', 'test'], private: false },
  { id: 'Hiking', albumName: 'Hiking', desc: 'Hiking', tags: ['hiking'], private: false },
  { id: 'Shoes', albumName: 'Shoes', desc: 'Shoes', tags: [], private: false },
  {
    id: 'Do something secret',
    albumName: 'Do something secret',
    desc: 'Do something secret',
    tags: ['secret'],
    private: true,
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
