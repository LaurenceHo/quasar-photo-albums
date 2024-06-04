import { Handler, DynamoDBStreamEvent } from 'aws-lambda';
import { ALBUM_WITH_LOCATIONS, DataAggregationEntity } from '../schemas/aggregation.js';
import AlbumService from '../services/album-service.js';

export const handler: Handler = async (event: DynamoDBStreamEvent, context, callback) => {
  console.log(JSON.stringify(event, null, 2));

  const albumService = new AlbumService();

  const albumLists = await albumService.findAll(
    'scan',
    null,
    ['year', 'id', 'albumName', 'albumCover', 'place'],
    ({ place, isPrivate }: any, { exists, eq }: any) => `${exists(place)} AND ${eq(isPrivate, false)}`
  );

  try {
    await DataAggregationEntity.update({
      key: ALBUM_WITH_LOCATIONS,
    })
      .set({ value: albumLists })
      .go({ response: 'none' });
    callback(null, 'success');
  } catch (err: any) {
    callback(err);
  }
};
