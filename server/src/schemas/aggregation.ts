import { CustomAttributeType, Entity } from 'electrodb';
import { ddbDocClient } from '../services/dynamodb-client.js';
import { Album } from './album.js';

interface AlbumsByYear {
  year: string;
  sum: number;
}

type ValueMap = {
  ALBUM_WITH_LOCATIONS: Album[];
  ALBUM_BY_YEARS: AlbumsByYear[];
  FEATURED_ALBUMS: Album[];
};

export interface DataAggregation<K extends keyof ValueMap> {
  key: K;
  value: ValueMap[K];
}

export const dataAggregationsTableName = process.env.DATA_AGGREGATIONS_TABLE_NAME || 'data-aggregations';

type ValueAttributes = Album[] | AlbumsByYear[];

export const ALBUM_WITH_LOCATIONS = 'ALBUM_WITH_LOCATIONS';
export const ALBUM_BY_YEARS = 'ALBUM_BY_YEARS';
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
        type: [ALBUM_WITH_LOCATIONS, ALBUM_BY_YEARS, FEATURED_ALBUMS] as const,
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
