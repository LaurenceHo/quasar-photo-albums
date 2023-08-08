import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { error } from 'firebase-functions/logger';
import _ from 'lodash';
import { AlbumV2 } from '../models';

const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});
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
 */
const PHOTO_ALBUMS_TABLE_NAME = 'quasar-photo-albums';
const PHOTO_ALBUM_TAGS_TABLE_NAME = 'quasar-album-tags';
const PHOTO_USER_PERMISSION_TABLE_NAME = 'quasar-user-permission';
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
    error(`Failed to query user permission: ${err}`);
    throw Error('Error when query user permission');
  }
};

/**
 * Operation for photo albums
 */
export const queryPhotoAlbumsV2 = async (isAdmin: boolean) => {
  let params = {
    TableName: PHOTO_ALBUMS_TABLE_NAME,
    ProjectionExpression: 'id, albumName, albumCover, description, tags, isPrivate',
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
    const albumList: AlbumV2[] = [];
    const response = await ddbDocClient.send(new ScanCommand(params));
    if (response.Items) {
      for (const album of response.Items) {
        albumList.push(album as AlbumV2);
      }
    }
    return albumList;
  } catch (err) {
    error(`Failed to query photo album: ${err}`);
    throw Error('Error when query photo albums');
  }
};

export const createPhotoAlbumV2 = async (album: AlbumV2) => {
  const params = {
    TableName: PHOTO_ALBUMS_TABLE_NAME,
    Item: album,
  };

  try {
    return await ddbDocClient.send(new PutCommand(params));
  } catch (err) {
    error(`Failed to create photo album: ${err}`);
    throw Error('Error when insert photo album');
  }
};

export const updatePhotoAlbumV2 = (album: AlbumV2) => {
  // TODO
};

export const deletePhotoAlbumV2 = (albumId: string) => {
  // TODO
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
    error(`Failed to query photo album tags: ${err}`);
    throw Error('Error when query photo album tags');
  }
};
export const createPhotoAlbumTagV2 = async (tag: string) => {
  const params = {
    TableName: PHOTO_ALBUM_TAGS_TABLE_NAME,
    Item: {
      tag,
    },
  };

  try {
    return await ddbDocClient.send(new PutCommand(params));
  } catch (err) {
    error(`Failed to create album tag: ${err}`);
    throw Error('Error when creating album tag');
  }
};

export const deletePhotoAlbumTagV2 = (tag: string) => {
  // TODO
};
