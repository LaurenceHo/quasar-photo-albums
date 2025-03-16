import { CustomAttributeType, Entity, EntityRecord } from 'electrodb';
import { ddbDocClient } from '../services/dynamodb-client.js';
import { Place } from '../types';

export type Album = EntityRecord<typeof AlbumEntity> & Place;

export const albumTableName = process.env['PHOTO_ALBUMS_TABLE_NAME'] || 'photo-albums';

type PlaceAttributes =
  | {
      displayName: {
        type: 'string';
      };
      formattedAddress: {
        type: 'string';
      };
      location: {
        type: 'map';
        properties: {
          latitude: {
            type: 'number';
          };
          longitude: {
            type: 'number';
          };
        };
      };
    }
  | null
  | undefined;

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
        // Ideally it should be a set of strings, but we are using a list for now because set cannot be empty in DynamoDB
        type: 'list',
        items: {
          type: 'string',
        },
      },
      place: {
        type: CustomAttributeType<PlaceAttributes>('any'),
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
  { client: ddbDocClient, table: albumTableName },
);
