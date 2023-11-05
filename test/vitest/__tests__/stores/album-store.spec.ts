import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach } from 'vitest';
import { albumStore } from '../../../../src/stores/album-store';
import { mockAlbumList } from '../mock-data';

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
    expect(store.filteredAlbumList('', [])).toEqual(mockAlbumList);
    expect(store.filteredAlbumList('food', [])).toEqual([
      { id: 'Food', albumName: 'Food title', description: 'Food desc', tags: ['food', 'test'], isPrivate: false },
    ]);
    expect(store.chunkAlbumList(0, 2)).toEqual([
      { id: 'Sport', albumName: 'Sport', description: 'Sport', tags: ['sport'], isPrivate: false },
      { id: 'Food', albumName: 'Food title', description: 'Food desc', tags: ['food', 'test'], isPrivate: false },
    ]);
    store.allAlbumList = [];
    expect(store.chunkAlbumList(0, 2)).toEqual([]);
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
});
