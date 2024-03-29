import { CreateTableCommandInput } from '@aws-sdk/client-dynamodb';
import { Entity, EntityRecord } from 'electrodb';
import { ddbDocClient } from '../services/dynamodb-client';

export type UserPermission = EntityRecord<typeof UserPermissionEntity>;

export const userTableName = process.env.PHOTO_USER_PERMISSION_TABLE_NAME || 'user-permission';

export const userPermissionTableSchema: CreateTableCommandInput = {
  AttributeDefinitions: [
    {
      AttributeName: 'uid',
      AttributeType: 'S',
    },
    {
      AttributeName: 'email',
      AttributeType: 'S',
    },
  ],
  KeySchema: [
    {
      AttributeName: 'uid',
      KeyType: 'HASH',
    },
    {
      AttributeName: 'email',
      KeyType: 'RANGE',
    },
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 1,
    WriteCapacityUnits: 1,
  },
  TableName: userTableName,
};

export const UserPermissionEntity = new Entity(
  {
    model: {
      entity: 'userPermissionEntity',
      version: '1',
      service: 'userPermissionService',
    },
    attributes: {
      uid: {
        type: 'string',
        required: true,
      },
      email: {
        type: 'string',
        required: true,
      },
      displayName: {
        type: 'string',
        required: true,
      },
      role: {
        type: 'string',
        required: true,
      },
    },
    indexes: {
      byUid: {
        pk: {
          field: 'uid',
          composite: ['uid'],
        },
        sk: {
          field: 'email',
          composite: ['email'],
        },
      },
    },
  },
  { client: ddbDocClient, table: userTableName }
);
