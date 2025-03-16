import { Entity, EntityRecord } from 'electrodb';
import { ddbDocClient } from '../services/dynamodb-client.js';

export type AlbumTag = EntityRecord<typeof AlbumTagEntity>;

export const albumTagsTableName = process.env['PHOTO_ALBUM_TAGS_TABLE_NAME'] || 'photo-album-tags';

export const AlbumTagEntity = new Entity(
  {
    model: {
      entity: 'albumTag',
      version: '1',
      service: 'albumService',
    },
    attributes: {
      tag: {
        type: 'string',
        required: true,
      },
    },
    indexes: {
      byTag: {
        pk: {
          field: 'tag',
          composite: ['tag'],
        },
      },
    },
  },
  { client: ddbDocClient, table: albumTagsTableName },
);
