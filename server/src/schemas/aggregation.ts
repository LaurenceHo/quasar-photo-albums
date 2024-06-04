import { CustomAttributeType, Entity, EntityRecord } from 'electrodb';
import { ddbDocClient } from '../services/dynamodb-client.js';
import { Album } from './album.js';

export type DataAggregation = EntityRecord<typeof DataAggregationEntity>;

export const dataAggregationsTableName = process.env.DATA_AGGREGATIONS_TABLE_NAME || 'data-aggregations';

type ValueAttributes = Album[] | { year: string; sum: number }[];

export const DataAggregationEntity = new Entity(
  {
    model: {
      entity: 'dataAggregations',
      version: '1',
      service: 'aggregationService',
    },
    attributes: {
      key: {
        type: ['ALBUM_WITH_LOCATIONS', 'ALBUM_BY_YEARS'] as const,
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
