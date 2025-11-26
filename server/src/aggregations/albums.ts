import { DynamoDBStreamEvent, Handler } from 'aws-lambda';
import logger from 'pino';
import {
  ALBUMS_WITH_LOCATION,
  AlbumsByYear,
  COUNT_ALBUMS_BY_YEAR,
  COUNT_ALBUMS_BY_YEAR_EXCLUDE_PRIVATE,
  DataAggregationEntity,
  FEATURED_ALBUMS,
} from '../schemas/aggregation.js';
import { Album } from '../types/album.js';
import { D1Client } from '../d1/d1-client.js';

const albumClient = new D1Client('albums', ['place']);

export const countAlbumsByYear = (albums: Album[]): AlbumsByYear =>
  albums
    .reduce((acc, album) => {
      const existingYear = acc.find((item) => item.year === album.year);
      if (existingYear) {
        existingYear.count++;
      } else {
        acc.push({ year: album.year, count: 1 });
      }
      return acc;
    }, [] as AlbumsByYear)
    .sort((a, b) => b.year.localeCompare(a.year));

export const handler: Handler = async (event: DynamoDBStreamEvent, _context, callback) => {
  logger().info(JSON.stringify(event, null, 2));

  const albumList = await albumClient.find<Album>({});

  const publicAlbums = albumList.filter((album) => album.isPrivate === false);
  const albumsHavePlace = publicAlbums.filter((album) => album.place != null);
  const featuredAlbums = publicAlbums
    .filter((album) => album.isFeatured)
    .sort((a, b) => a.year.localeCompare(b.year)) // Sort by year
    .sort((a, b) => a.albumName.localeCompare(b.albumName)); // Then sort by album name
  const albumsByYear = countAlbumsByYear(albumList);
  const albumsByYearExcludePrivate = countAlbumsByYear(publicAlbums);

  try {
    await Promise.all([
      // Insert albums with location
      DataAggregationEntity.update({
        key: ALBUMS_WITH_LOCATION,
      })
        .set({ value: albumsHavePlace, updatedAt: new Date().toISOString() })
        .go({ response: 'none' }),
      // Insert featured albums
      DataAggregationEntity.update({
        key: FEATURED_ALBUMS,
      })
        .set({ value: featuredAlbums, updatedAt: new Date().toISOString() })
        .go({ response: 'none' }),
      // Insert count albums by year
      DataAggregationEntity.update({
        key: COUNT_ALBUMS_BY_YEAR,
      })
        .set({ value: albumsByYear, updatedAt: new Date().toISOString() })
        .go({ response: 'none' }),
      DataAggregationEntity.update({
        key: COUNT_ALBUMS_BY_YEAR_EXCLUDE_PRIVATE,
      })
        .set({ value: albumsByYearExcludePrivate, updatedAt: new Date().toISOString() })
        .go({ response: 'none' }),
    ]);

    callback(null, 'success');
  } catch (err: any) {
    callback(err);
  }
};
