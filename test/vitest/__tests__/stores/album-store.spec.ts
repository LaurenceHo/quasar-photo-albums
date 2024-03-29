import { setActivePinia, createPinia } from 'pinia';
import { afterEach, describe, it, expect, beforeEach, vi } from 'vitest';
import { albumStore } from '../../../../src/stores/album-store';
import {
  mockAlbumList,
  mockAlbumTagList,
  mockGetAlbumsResponse,
  mockGetAlbumTagsResponse,
  mockGetUserPermissionResponse,
} from '../mock-data';

vi.mock('../../../../src/utils/helper', async () => {
  const actual: any = await vi.importActual('../../../../src/utils/helper');
  return {
    ...actual,
    compareDbUpdatedTime: vi
      .fn()
      .mockImplementation(() => Promise.resolve({ isLatest: false, time: new Date(Date.now()).toISOString() })),
  };
});

vi.mock('../../../../src/services/auth-service', () => ({
  default: vi.fn().mockImplementation(() => ({
    getUserInfo: () => Promise.resolve(mockGetUserPermissionResponse),
  })),
}));

vi.mock('../../../../src/services/album-service', () => ({
  default: vi.fn().mockImplementation(() => ({
    getAlbums: () => Promise.resolve(mockGetAlbumsResponse),
  })),
}));

vi.mock('../../../../src/services/album-tag-service', () => ({
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
    store.allAlbumList = [];
  });

  it('updateRefreshAlbumListFlag', () => {
    const store = albumStore();
    expect(store.refreshAlbumList).toBeFalsy();
    store.updateRefreshAlbumListFlag();
    expect(store.refreshAlbumList).toBeTruthy();
  });

  it('filteredAlbumList', () => {
    const store = albumStore();
    store.allAlbumList = mockAlbumList;
    expect(store.filteredAlbumList('', [], false)).toEqual(mockAlbumList);
    expect(store.filteredAlbumList('food', [], false)).toEqual([
      { id: 'Food', albumName: 'Food title', description: 'Food desc', tags: ['food', 'test'], isPrivate: false },
    ]);
    expect(store.chunkAlbumList(0, 2)).toEqual([
      { id: 'Sport', albumName: 'Sport', description: 'Sport', tags: ['sport'], isPrivate: false },
      { id: 'Food', albumName: 'Food title', description: 'Food desc', tags: ['food', 'test'], isPrivate: false },
    ]);
    // Filter private album
    expect(store.filteredAlbumList('', [], true)).toEqual([
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
    ]);
    store.allAlbumList = [];
    expect(store.chunkAlbumList(0, 2)).toEqual([]);
  });

  it('albumsHaveLocation', () => {
    const store = albumStore();
    store.allAlbumList = mockAlbumList;
    expect(store.albumsHaveLocation).toEqual([
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
    ]);
  });

  it('updateAlbumCover', () => {
    const store = albumStore();
    store.allAlbumList = mockAlbumList;
    store.updateAlbumCover({
      id: 'Sport',
      albumName: 'Sport Update',
      description: 'Sport',
      tags: ['sport'],
      isPrivate: false,
    });
    expect(store.allAlbumList[0].albumName).toEqual('Sport Update');
  });

  it('updateAlbum', () => {
    const store = albumStore();
    store.allAlbumList = mockAlbumList;
    // If album exists
    store.updateAlbum(
      {
        id: 'Sport',
        albumName: 'Sport Update',
        description: 'Sport',
        tags: ['sport'],
        isPrivate: false,
      },
      false
    );
    expect(store.allAlbumList[0].albumName).toEqual('Sport Update');
    expect(store.allAlbumList.length).toEqual(5);
    // If album doesn't exist
    store.updateAlbum(
      {
        id: 'Sport1',
        albumName: 'Sport Update',
        description: 'Sport',
        tags: ['sport'],
        isPrivate: false,
      },
      false
    );
    expect(store.allAlbumList.length).toEqual(6);
    expect(store.allAlbumList.find((album) => album.id === 'Sport1')).not.toBeNull();
    // Delete album
    store.updateAlbum(
      {
        id: 'Sport1',
        albumName: 'Sport Update',
        description: 'Sport',
        tags: ['sport'],
        isPrivate: false,
      },
      true
    );
    expect(store.allAlbumList.length).toEqual(5);
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

  it('getAllAlbumInformation', async () => {
    const store = albumStore();
    await store.getAllAlbumInformation();
    expect(store.allAlbumList.length).toEqual(6);
    expect(store.allAlbumList[0]).toEqual({
      albumCover: 'album5/aaa.jpg',
      isPrivate: false,
      order: 213,
      albumName: 'album5',
      description: 'description',
      id: 'album5',
      tags: ['tag1'],
    });
    expect(store.albumTags).toEqual(mockGetAlbumTagsResponse.data);
    expect(store.albumTags[1]).toEqual({ tag: 'tag2' });
  });
});
