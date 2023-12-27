import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach } from 'vitest';
import { albumStore } from '../../../../src/stores/album-store';
import { mockAlbumList, mockAlbumTagList } from '../mock-data';

describe('Album Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
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
});
