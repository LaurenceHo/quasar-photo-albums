import { Handler, DynamoDBStreamEvent } from 'aws-lambda';

export const handler: Handler = async (event: DynamoDBStreamEvent, context, callback) => {
  console.log(JSON.stringify(event, null, 2));
  event.Records.forEach((record) => {
    console.log(record.eventID);
    console.log(record.eventName);
    console.log('DynamoDB Record: %j', record.dynamodb);
  });
  callback(null, 'message');
};
