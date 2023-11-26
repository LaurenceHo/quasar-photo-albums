import { DynamoDBClient, DynamoDBClientConfig, ReturnValue } from '@aws-sdk/client-dynamodb';
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import dotenv from 'dotenv';
import _ from 'lodash';
import { AlbumV2 } from '../models';
import { uploadObject } from './aws-s3-service';

dotenv.config();

const configuration = {
  region: process.env.AWS_REGION,
};

if (process.env.NODE_ENV === 'development') {
  (configuration as DynamoDBClientConfig).credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_KEY!,
  };
}

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

/*
quasar-photo-albums dynamodb table schema:
id: string => it is the same as the folder name in s3
albumName: string
albumCover: string
description: string
tags: string[]
isPrivate: boolean
order: number
createdAt: string (Date time)
updatedAt: string (Date time)
createdBy: string (email)
updatedBy: string (email)
 */
const PHOTO_ALBUMS_TABLE_NAME = 'quasar-photo-albums';
const PHOTO_ALBUM_TAGS_TABLE_NAME = 'quasar-album-tags';
const PHOTO_USER_PERMISSION_TABLE_NAME = 'quasar-user-permission';

// TODO - Implement the basic CRUD operations
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
    return _.get(response, 'Items[0]', null);
  } catch (err) {
    console.error(`Failed to query user permission: ${err}`);
    throw Error('Error when fetching user permission');
  }
};

/**
 * Operation for photo albums
 */
export const queryPhotoAlbumsV2 = async (isAdmin: boolean) => {
  let params = {
    TableName: PHOTO_ALBUMS_TABLE_NAME,
    IndexName: 'id-order-index',
    ProjectionExpression: 'id, albumName, albumCover, description, tags, isPrivate, #Order',
    ExpressionAttributeNames: { '#Order': 'order' },
    // TODO - Need to sort by order
  } as any;
  if (!isAdmin) {
    params = {
      ...params,
      ExpressionAttributeValues: {
        ':val': false,
      },
      FilterExpression: 'isPrivate = :val',
    };
  }
  try {
    const response = await ddbDocClient.send(new ScanCommand(params));

    return response.Items as AlbumV2[];
  } catch (err) {
    console.error(`Failed to query photo album: ${err}`);
    throw Error('Error when fetching photo albums');
  }
};

export const createPhotoAlbumV2 = async (album: AlbumV2) => {
  try {
    const result = await ddbDocClient.send(
      new PutCommand({
        TableName: PHOTO_ALBUMS_TABLE_NAME,
        Item: album,
      })
    );

    if (result.$metadata.httpStatusCode === 200) {
      await uploadObject('updateDatabaseAt.json', JSON.stringify({ time: new Date().toISOString() }));
    }
    return result;
  } catch (err) {
    console.error(`Failed to insert photo album: ${err}`);
    throw Error('Error when creating photo album');
  }
};

export const updatePhotoAlbumV2 = async (album: AlbumV2) => {
  const params = {
    TableName: PHOTO_ALBUMS_TABLE_NAME,
    Key: {
      id: album.id,
    },
    ExpressionAttributeNames: { '#Order': 'order' },
    UpdateExpression:
      'SET albumName = :albumName, ' +
      'albumCover = :albumCover, ' +
      'description = :description, ' +
      'tags = :tags, ' +
      'isPrivate = :isPrivate, ' +
      '#Order = :order,' +
      'updatedAt = :updatedAt, ' +
      'updatedBy = :updatedBy',
    ExpressionAttributeValues: {
      ':albumName': album.albumName,
      ':albumCover': album.albumCover,
      ':description': album.description,
      ':tags': album.tags,
      ':isPrivate': album.isPrivate,
      ':order': album.order,
      ':updatedAt': album.updatedAt,
      ':updatedBy': album.updatedBy,
    },
    ReturnValues: ReturnValue.ALL_NEW,
  };

  try {
    const result = await ddbDocClient.send(new UpdateCommand(params));

    if (result.$metadata.httpStatusCode === 200) {
      await uploadObject('updateDatabaseAt.json', JSON.stringify({ time: new Date().toISOString() }));
    }
    return result;
  } catch (err) {
    console.error(`Failed to update photo album: ${err}`);
    throw Error('Error when updating photo album');
  }
};

export const deletePhotoAlbumV2 = async (id: string) => {
  try {
    const result = await ddbDocClient.send(
      new DeleteCommand({
        TableName: PHOTO_ALBUMS_TABLE_NAME,
        Key: {
          id,
        },
      })
    );

    if (result.$metadata.httpStatusCode === 200) {
      await uploadObject('updateDatabaseAt.json', JSON.stringify({ time: new Date().toISOString() }));
    }

    return result;
  } catch (err) {
    console.error(`Failed to delete photo album: ${err}`);
    throw Error('Error when deleting photo album');
  }
};

/**
 * Operations for album tags
 */
export const queryAlbumTagsV2 = async () => {
  try {
    const response = await ddbDocClient.send(
      new ScanCommand({
        TableName: PHOTO_ALBUM_TAGS_TABLE_NAME,
      })
    );
    return response.Items;
  } catch (err) {
    console.error(`Failed to query album tags: ${err}`);
    throw Error('Error when fetching album tags');
  }
};
export const createPhotoAlbumTagV2 = async (tag: { tag: string }) => {
  try {
    const result = await ddbDocClient.send(
      new PutCommand({
        TableName: PHOTO_ALBUM_TAGS_TABLE_NAME,
        Item: {
          tag: tag.tag,
        },
      })
    );

    if (result.$metadata.httpStatusCode === 200) {
      await uploadObject('updateDatabaseAt.json', JSON.stringify({ time: new Date().toISOString() }));
    }
    return result;
  } catch (err) {
    console.error(`Failed to create album tag: ${err}`);
    throw Error('Error when creating album tag');
  }
};

export const deletePhotoAlbumTagV2 = async (tag: string) => {
  try {
    const result = await ddbDocClient.send(
      new DeleteCommand({
        TableName: PHOTO_ALBUM_TAGS_TABLE_NAME,
        Key: {
          tag,
        },
      })
    );

    if (result.$metadata.httpStatusCode === 200) {
      await uploadObject('updateDatabaseAt.json', JSON.stringify({ time: new Date().toISOString() }));
    }
    return result;
  } catch (err) {
    console.error(`Failed to delete album tag: ${err}`);
    throw Error('Error when deleting album tag');
  }
};
