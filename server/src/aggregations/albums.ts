import { Handler, DynamoDBStreamEvent } from 'aws-lambda';
import {
  ALBUM_BY_YEARS,
  ALBUM_WITH_LOCATIONS,
  DataAggregationEntity,
  FEATURED_ALBUMS,
} from '../schemas/aggregation.js';
import { Album } from '../schemas/album.js';
import AlbumService from '../services/album-service.js';

export const countAlbumsByYear = (albums: Album[]): Record<string, number>[] => {
  const yearCount: Record<string, number> = {};

  albums.forEach((album) => {
    yearCount[album.year] = (yearCount[album.year] || 0) + 1;
  });

  return Object.keys(yearCount)
    .sort()
    .reverse()
    .map((year) => ({ [year]: yearCount[year] }));
};

export const handler: Handler = async (event: DynamoDBStreamEvent, context, callback) => {
  console.log(JSON.stringify(event, null, 2));

  const albumService = new AlbumService();

  // Get all public albums
  const albumList = await albumService.findAll(
    'scan',
    null,
    ['year', 'id', 'albumName', 'albumCover', 'place', 'isFeatured'],
    ({ isPrivate }: any, { eq }: any) => `${eq(isPrivate, false)}`
  );

  const albumsHavePlace = albumList.filter((album) => album.place != null);
  const featuredAlbums = albumList.filter((album) => album.isFeatured);
  const albumsByYear = countAlbumsByYear(albumList);

  try {
    await Promise.all([
      // Insert albums with location
      DataAggregationEntity.update({
        key: ALBUM_WITH_LOCATIONS,
      })
        .set({ value: albumsHavePlace, updatedAt: new Date().toISOString() })
        .go({ response: 'none' }),
      // Insert featured albums
      DataAggregationEntity.update({
        key: FEATURED_ALBUMS,
      })
        .set({ value: featuredAlbums, updatedAt: new Date().toISOString() })
        .go({ response: 'none' }),
      // Insert albums by year
      DataAggregationEntity.update({
        key: ALBUM_BY_YEARS,
      })
        .set({ value: albumsByYear, updatedAt: new Date().toISOString() })
        .go({ response: 'none' }),
    ]);

    callback(null, 'success');
  } catch (err: any) {
    callback(err);
  }
};
