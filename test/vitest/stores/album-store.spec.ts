import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { albumStore } from '../../../src/stores/album-store';
import {
  mockAlbumList,
  mockAlbumTagList,
  mockGetAlbumsResponse,
  mockGetAlbumTagsResponse,
  mockGetUserPermissionResponse,
} from '../mock-data';

vi.mock('../../../src/utils/helper', async () => {
  const actual: any = await vi.importActual('../../../src/utils/helper');
  return {
    ...actual,
    compareDbUpdatedTime: vi
      .fn()
      .mockImplementation(() => Promise.resolve({ isLatest: false, time: new Date(Date.now()).toISOString() })),
  };
});

vi.mock('../../../src/services/auth-service', () => ({
  default: vi.fn().mockImplementation(() => ({
    getUserInfo: () => Promise.resolve(mockGetUserPermissionResponse),
  })),
}));

vi.mock('../../../src/services/album-service', () => ({
  default: vi.fn().mockImplementation(() => ({
    getAlbumsByYear: () => Promise.resolve(mockGetAlbumsResponse),
  })),
}));

vi.mock('../../../src/services/album-tag-service', () => ({
  default: vi.fn().mockImplementation(() => ({
    getAlbumTags: () => Promise.resolve(mockGetAlbumTagsResponse),
  })),
}));

describe('Album Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  afterEach(() => {
    const store = albumStore();
    store.albumList = [];
  });

  it('updateRefreshAlbumListFlag', () => {
    const store = albumStore();
    expect(store.refreshAlbumList).toBeFalsy();
    store.updateRefreshAlbumListFlag();
    expect(store.refreshAlbumList).toBeTruthy();
  });

  it('filteredAlbumList', () => {
    const store = albumStore();
    store.albumList = mockAlbumList;
    expect(store.filteredAlbumList('', [], false)).toEqual(mockAlbumList);
    expect(store.filteredAlbumList('food', [], false)).toEqual([
      {
        id: 'food',
        albumName: 'Food title',
        description: 'Food desc',
        tags: ['food', 'test'],
        isPrivate: false,
        year: '2024',
      },
    ]);
    expect(store.chunkAlbumList(0, 2)).toEqual([
      {
        id: 'sport',
        albumName: 'Sport',
        description: 'Sport desc',
        tags: ['sport'],
        isPrivate: false,
        year: '2024',
        albumCover: 'thisIsAlbumCover/aaa.jpg',
      },
      {
        id: 'food',
        albumName: 'Food title',
        description: 'Food desc',
        tags: ['food', 'test'],
        isPrivate: false,
        year: '2024',
      },
    ]);
    // Filter private album
    expect(store.filteredAlbumList('', [], true)).toEqual([
      {
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
        year: '2024',
      },
    ]);
    store.albumList = [];
    expect(store.chunkAlbumList(0, 2)).toEqual([]);
  });

  it('albumsHaveLocation', () => {
    const store = albumStore();
    store.albumList = mockAlbumList;
    expect(store.albumsHaveLocation).toEqual([
      {
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
        year: '2024',
      },
    ]);
  });

  it('updateAlbumCover', () => {
    const store = albumStore();
    store.albumList = mockAlbumList;
    store.updateAlbumCover({
      id: 'sport',
      albumName: 'Sport Update',
      description: 'Sport',
      tags: ['sport'],
      isPrivate: false,
      year: '2024',
    });
    expect(store.albumList[0].albumName).toEqual('Sport Update');
  });

  it('updateAlbum', () => {
    const store = albumStore();
    store.albumList = mockAlbumList;
    store.selectedYear = '2024';
    // If album exists
    store.updateAlbum(
      {
        id: 'sport',
        albumName: 'Sport Update 2',
        description: 'Sport',
        tags: ['sport'],
        isPrivate: false,
        year: '2024',
      },
      false
    );
    expect(store.albumList[0].albumName).toEqual('Sport Update 2');
    expect(store.albumList.length).toEqual(11);
    // If album doesn't exist
    store.updateAlbum(
      {
        id: 'sport123',
        albumName: 'Sport Update',
        description: 'Sport',
        tags: ['sport'],
        isPrivate: false,
        year: '2024',
      },
      false
    );
    expect(store.albumList.length).toEqual(12);
    expect(store.albumList.find((album) => album.id === 'sport123')).not.toBeNull();
    // Delete album
    store.updateAlbum(
      {
        id: 'sport123',
        albumName: 'Sport Update',
        description: 'Sport',
        tags: ['sport'],
        isPrivate: false,
        year: '2024',
      },
      true
    );
    expect(store.albumList.length).toEqual(11);
  });

  it('updateAlbumTags', () => {
    const store = albumStore();
    store.albumTags = mockAlbumTagList;
    expect(store.albumTags.length).toEqual(3);
    // Add tag
    store.updateAlbumTags(
      {
        tag: 'sport1',
      },
      false
    );
    expect(store.albumTags.length).toEqual(4);
    // Delete tag
    store.updateAlbumTags(
      {
        tag: 'sport1',
      },
      true
    );
    expect(store.albumTags.length).toEqual(3);
  });

  it('getAlbumsByYear', async () => {
    const store = albumStore();
    await store.getAlbumsByYear();
    expect(store.albumList.length).toEqual(11);
    expect(store.albumList[1]).toEqual({
      year: '2024',
      id: 'shoes',
      albumName: 'Shoes',
      description: 'Shoes desc',
      tags: [],
      isPrivate: false,
    });
    expect(store.albumList[10]).toEqual({
      albumCover: 'album6/aaa.jpg',
      isPrivate: false,
      albumName: '6-album-6',
      description: '',
      id: 'album1',
      tags: [],
      year: '2024',
    });
    expect(store.albumTags).toEqual(mockGetAlbumTagsResponse.data);
    expect(store.albumTags[1]).toEqual({ tag: 'tag2' });
  });
});
