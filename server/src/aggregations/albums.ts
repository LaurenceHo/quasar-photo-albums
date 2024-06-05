import { Handler, DynamoDBStreamEvent } from 'aws-lambda';
import {
  ALBUM_BY_YEARS,
  ALBUM_WITH_LOCATIONS,
  DataAggregationEntity,
  FEATURED_ALBUMS,
} from '../schemas/aggregation.js';
import AlbumService from '../services/album-service.js';

export const handler: Handler = async (event: DynamoDBStreamEvent, context, callback) => {
  console.log(JSON.stringify(event, null, 2));

  const albumService = new AlbumService();

  // Get all public albums
  const albumLists = await albumService.findAll(
    'scan',
    null,
    ['year', 'id', 'albumName', 'albumCover', 'place', 'isFeatured'],
    ({ isPrivate }: any, { eq }: any) => `${eq(isPrivate, false)}`
  );

  const albumsHavePlace = albumLists.filter((album) => album.place != null);
  const featuredAlbums = albumLists.filter((album) => album.isFeatured);
  const albumsByYear = albumLists
    .sort((a, b) => (a.year > b.year ? 1 : -1))
    .reduce(
      (acc, album) => {
        if (!acc[album.year]) {
          acc[album.year] = 0;
        }
        acc[album.year]++;
        return acc;
      },
      {} as Record<string, number>
    );

  try {
    // Insert albums with location
    await DataAggregationEntity.update({
      key: ALBUM_WITH_LOCATIONS,
    })
      .set({ value: albumsHavePlace })
      .go({ response: 'none' });

    // Insert featured albums
    await DataAggregationEntity.update({
      key: FEATURED_ALBUMS,
    })
      .set({ value: featuredAlbums })
      .go({ response: 'none' });

    // Insert albums by year
    await DataAggregationEntity.update({
      key: ALBUM_BY_YEARS,
    })
      .set({ value: albumsByYear })
      .go({ response: 'none' });
    callback(null, 'success');
  } catch (err: any) {
    callback(err);
  }
};
