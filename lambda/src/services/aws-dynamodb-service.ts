import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import get from 'lodash/get';
import { configuration } from './config';

const dynamoClient = new DynamoDBClient(configuration);

const marshallOptions = {
  // Whether to automatically convert empty strings, blobs, and sets to `null`.
  convertEmptyValues: false, // false, by default.
  // Whether to remove undefined values while marshalling.
  removeUndefinedValues: true, // false, by default.
  // Whether to convert typeof object to map attribute.
  convertClassInstanceToMap: false, // false, by default.
};

const unmarshallOptions = {
  // Whether to return numbers as a string instead of converting them to native JavaScript numbers.
  wrapNumbers: false, // false, by default.
};

const ddbDocClient = DynamoDBDocumentClient.from(dynamoClient, {
  marshallOptions,
  unmarshallOptions,
});

const PHOTO_USER_PERMISSION_TABLE_NAME = process.env.PHOTO_USER_PERMISSION_TABLE_NAME ?? '';

export const queryUserPermissionV2 = async (uid: string) => {
  const params = {
    TableName: PHOTO_USER_PERMISSION_TABLE_NAME,
    ExpressionAttributeValues: {
      ':uid': uid,
    },
    KeyConditionExpression: 'uid = :uid',
  };

  try {
    const response = await ddbDocClient.send(new QueryCommand(params));
    return get(response, 'Items[0]', null);
  } catch (err) {
    console.error(`Failed to query user permission: ${err}`);
    throw Error('Error when fetching user permission');
  }
};
