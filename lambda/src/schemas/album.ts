import { CreateTableCommandInput } from '@aws-sdk/client-dynamodb';
import { Entity } from 'electrodb';
import { ddbDocClient } from '../services/dynamodb-client';

export const albumTableName = process.env.PHOTO_ALBUMS_TABLE_NAME || 'photo-albums';

export const albumTableSchema: CreateTableCommandInput = {
  AttributeDefinitions: [
    {
      AttributeName: 'id',
      AttributeType: 'S',
    },
  ],
  KeySchema: [
    {
      AttributeName: 'id',
      KeyType: 'HASH',
    },
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 1,
    WriteCapacityUnits: 1,
  },
  TableName: albumTableName,
};

export const AlbumEntity = new Entity(
  {
    model: {
      entity: 'album',
      version: '1',
      service: 'albumService',
    },
    attributes: {
      id: {
        type: 'string',
        required: true,
      },
      albumName: {
        type: 'string',
        required: true,
      },
      description: {
        type: 'string',
      },
      albumCover: {
        type: 'string',
      },
      isPrivate: {
        type: 'boolean',
        required: true,
      },
      place: {
        type: 'any',
      },
      tags: {
        type: 'set',
        items: 'string',
      },
      createdAt: {
        type: 'string',
      },
      createdBy: {
        type: 'string',
      },
      updatedAt: {
        type: 'string',
      },
      updatedBy: {
        type: 'string',
      },
      order: {
        type: 'number',
      },
    },
    indexes: {
      byAlbumId: {
        pk: {
          field: 'id',
          composite: ['id'],
        },
      },
    },
  },
  { client: ddbDocClient, table: albumTableName }
);