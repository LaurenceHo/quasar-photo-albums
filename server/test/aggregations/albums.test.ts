import { describe, expect, test } from 'vitest';
import { countAlbumsByYear } from '../../src/aggregations/albums';

describe('aggregation albums', () => {
  test('verify count albums by year works', () => {
    const albumList = [
      {
        isPrivate: false,
        year: '2023',
        albumName: 'This is demo album 4',
        id: 'demo-album-4',
      },
      {
        isPrivate: false,
        year: '2023',
        albumName: '1 demo-album 1',
        id: 'demo-album1',
      },
      {
        isPrivate: false,
        year: '2000',
        albumName: 'demo-album 2',
        id: 'demo-album2',
      },
      {
        isPrivate: false,
        year: 'na',
        albumName: 'this is demo-album-3',
        id: 'demo-album3',
      },
      {
        isPrivate: false,
        year: '2024',
        albumName: '2024 demo album5',
        id: 'demo-album5',
      },
    ] as any;

    const sumAlbums = countAlbumsByYear(albumList);
    expect(sumAlbums).toStrictEqual([
      {
        na: 1,
      },
      {
        '2024': 1,
      },
      { '2023': 2 },
      { '2000': 1 },
    ]);
  });
});
