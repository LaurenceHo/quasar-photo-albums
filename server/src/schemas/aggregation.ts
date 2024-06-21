import { CustomAttributeType, Entity } from 'electrodb';
import { ddbDocClient } from '../services/dynamodb-client.js';
import { Album } from './album.js';

export type AlbumsByYear = { year: string; count: number }[];

type ValueMap = {
  ALBUMS_WITH_LOCATION: Album[];
  COUNT_ALBUMS_BY_YEAR: AlbumsByYear;
  FEATURED_ALBUMS: Album[];
};

export interface DataAggregation<K extends keyof ValueMap> {
  key: K;
  value: ValueMap[K];
}

export const dataAggregationsTableName = process.env['DATA_AGGREGATIONS_TABLE_NAME'] || 'data-aggregations';

type ValueAttributes = Album[] | AlbumsByYear;

export const ALBUMS_WITH_LOCATION = 'ALBUMS_WITH_LOCATION';
export const COUNT_ALBUMS_BY_YEAR = 'COUNT_ALBUMS_BY_YEAR';
export const FEATURED_ALBUMS = 'FEATURED_ALBUMS';

export const DataAggregationEntity = new Entity(
  {
    model: {
      entity: 'dataAggregations',
      version: '1',
      service: 'aggregationService',
    },
    attributes: {
      key: {
        type: [ALBUMS_WITH_LOCATION, COUNT_ALBUMS_BY_YEAR, FEATURED_ALBUMS] as const,
        required: true,
        readOnly: true,
      },
      value: {
        type: CustomAttributeType<ValueAttributes>('any'),
        required: true,
      },
      updatedAt: {
        type: 'string',
        required: true,
        default: () => new Date().toISOString(),
        set: () => new Date().toISOString(),
      },
    },
    indexes: {
      byKey: {
        pk: {
          field: 'pk',
          composite: ['key'],
        },
      },
    },
  },
  { client: ddbDocClient, table: dataAggregationsTableName }
);
