import { CreateTableCommandInput } from '@aws-sdk/client-dynamodb';
import { Entity, EntityRecord } from 'electrodb';
import { Place } from '../models.js';
import { ddbDocClient } from '../services/dynamodb-client.js';

export type Album = EntityRecord<typeof AlbumEntity> & Place;

export const albumTableName = process.env.PHOTO_ALBUMS_TABLE_NAME || 'photo-albums';

export const albumTableSchema: CreateTableCommandInput = {
  TableName: albumTableName,
  KeySchema: [
    {
      AttributeName: 'pk',
      KeyType: 'HASH',
    },
    {
      AttributeName: 'sk',
      KeyType: 'RANGE',
    },
  ],
  AttributeDefinitions: [
    {
      AttributeName: 'pk',
      AttributeType: 'S',
    },
    {
      AttributeName: 'sk',
      AttributeType: 'S',
    },
    {
      AttributeName: 'gsi1pk',
      AttributeType: 'S',
    },
    {
      AttributeName: 'gsi1sk',
      AttributeType: 'S',
    },
  ],
  GlobalSecondaryIndexes: [
    {
      IndexName: 'gsi1pk-gsi1sk-index',
      KeySchema: [
        {
          AttributeName: 'gsi1pk',
          KeyType: 'HASH',
        },
        {
          AttributeName: 'gsi1sk',
          KeyType: 'RANGE',
        },
      ],
      Projection: {
        ProjectionType: 'ALL',
      },
    },
  ],
  BillingMode: 'PAY_PER_REQUEST',
};

export const AlbumEntity = new Entity(
  {
    model: {
      entity: 'album',
      version: '1',
      service: 'albumService',
    },
    attributes: {
      year: {
        type: 'string',
        required: true,
        readOnly: true,
      },
      // it is the same as the folder name in s3
      id: {
        type: 'string',
        required: true,
        readOnly: true,
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
      tags: {
        type: 'set',
        items: 'string',
      },
      place: {
        type: 'map',
        properties: {
          displayName: {
            type: 'string',
          },
          formattedAddress: {
            type: 'string',
          },
          location: {
            type: 'map',
            properties: {
              latitude: {
                type: 'number',
              },
              longitude: {
                type: 'number',
              },
            },
          },
        },
      },
      createdAt: {
        type: 'string',
        required: true,
        readOnly: true,
        default: () => new Date().toISOString(),
        set: () => new Date().toISOString(),
      },
      createdBy: {
        type: 'string',
        required: true,
        readOnly: true,
      },
      updatedAt: {
        type: 'string',
        required: true,
        default: () => new Date().toISOString(),
        set: () => new Date().toISOString(),
      },
      updatedBy: {
        type: 'string',
        required: true,
      },
      order: {
        type: 'number',
        default: 1,
      },
    },
    indexes: {
      byYear: {
        pk: {
          field: 'pk',
          composite: ['year'],
        },
        sk: {
          field: 'sk',
          composite: ['id'],
        },
      },
      byOrder: {
        index: 'gsi1pk-gsi1sk-index',
        pk: {
          field: 'gsi1pk',
          composite: ['order'],
        },
        sk: {
          field: 'gsi1sk',
          composite: ['isPrivate'],
        },
      },
    },
  },
  { client: ddbDocClient, table: albumTableName }
);
