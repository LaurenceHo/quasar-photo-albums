import { CustomAttributeType, Entity, EntityRecord } from 'electrodb';
import { ddbDocClient } from '../services/dynamodb-client.js';
import { Place } from '../types';
import { PlaceAttributes } from './album.js';

export type TravelRecord = EntityRecord<typeof TravelRecordEntity> & Place;

export const travelRecordTableName = process.env['TRAVEL_RECORDS_TABLE_NAME'] || 'travel-records';

export const TravelRecordEntity = new Entity(
  {
    model: {
      entity: 'travelRecord',
      version: '1',
      service: 'travelService',
    },
    attributes: {
      // Departure + Destination
      id: {
        type: 'string',
        required: true,
        readOnly: true,
      },
      travelDate: {
        type: 'string',
        required: true,
      },
      departure: {
        type: CustomAttributeType<PlaceAttributes>('any'),
      },
      destination: {
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
      gsi1pk: {
        type: 'string',
        default: 'travelRecords',
        required: true,
      },
    },
    indexes: {
      byId: {
        pk: {
          field: 'pk',
          composite: ['id'],
        },
      },
      byTravelDate: {
        index: 'gsi1',
        pk: {
          field: 'gsi1pk',
          composite: ['gsi1pk'],
        },
        sk: {
          field: 'gsi1sk',
          composite: ['travelDate'],
        },
      },
    },
  },
  { client: ddbDocClient, table: travelRecordTableName },
);
