import { Handler, DynamoDBStreamEvent } from 'aws-lambda';
import { DataAggregationEntity } from '../schemas/aggregation.js';
import AlbumService from '../services/album-service.js';

export const handler: Handler = async (event: DynamoDBStreamEvent, context, callback) => {
  const albumService = new AlbumService();

  console.log(JSON.stringify(event, null, 2));
  event.Records.forEach((record) => {
    console.log(record.eventID);
    console.log(record.eventName);
    console.log('DynamoDB Record: %j', record.dynamodb);
  });

  const albumLists = await albumService.findAll(
    'scan',
    null,
    ['year', 'id', 'albumName', 'albumCover', 'place'],
    ({ place, isPrivate }: any, { exists, eq }: any) => `${exists(place)} AND ${eq(isPrivate, false)}`
  );

  try {
    await DataAggregationEntity.update({
      key: 'ALBUM_WITH_LOCATIONS',
    })
      .set({ value: albumLists })
      .go({ response: 'none' });
    callback(null, 'success');
  } catch (err: any) {
    callback(err);
  }
};
