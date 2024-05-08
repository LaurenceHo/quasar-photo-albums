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
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 1,
    WriteCapacityUnits: 1,
  },
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
      isFeatured: {
        type: 'boolean',
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
    },
  },
  { client: ddbDocClient, table: albumTableName }
);
