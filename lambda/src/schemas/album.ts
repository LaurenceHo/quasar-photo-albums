import { CreateTableCommandInput } from '@aws-sdk/client-dynamodb';
import { Entity, EntityRecord } from 'electrodb';
import { ddbDocClient } from '../services/dynamodb-client';

export type Album = EntityRecord<typeof AlbumEntity>;

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
      // it is the same as the folder name in s3
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
        type: 'map',
        properties: {
          displayName: {
            type: 'string',
            required: true,
          },
          formattedAddress: {
            type: 'string',
            required: true,
          },
          location: {
            type: 'map',
            properties: {
              latitude: {
                type: 'number',
                required: true,
              },
              longitude: {
                type: 'number',
                required: true,
              },
            },
          },
        },
      },
      tags: {
        type: 'set',
        items: 'string',
      },
      createdAt: {
        type: 'string',
        required: true,
      },
      createdBy: {
        type: 'string',
        required: true,
      },
      updatedAt: {
        type: 'string',
        required: true,
      },
      updatedBy: {
        type: 'string',
        required: true,
      },
      order: {
        type: 'number',
        default: 0,
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
