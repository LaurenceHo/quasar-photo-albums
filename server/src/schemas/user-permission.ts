import { Entity, EntityRecord } from 'electrodb';
import { ddbDocClient } from '../services/dynamodb-client.js';

export type UserPermission = EntityRecord<typeof UserPermissionEntity>;

export const userTableName = process.env['PHOTO_USER_PERMISSION_TABLE_NAME'] || 'user-permission';

export const UserPermissionEntity = new Entity(
  {
    model: {
      entity: 'userPermissionEntity',
      version: '1',
      service: 'userPermissionService'
    },
    attributes: {
      uid: {
        type: 'string',
        required: true
      },
      email: {
        type: 'string',
        required: true
      },
      displayName: {
        type: 'string',
        required: true
      },
      role: {
        type: 'string',
        required: true
      }
    },
    indexes: {
      byUid: {
        pk: {
          field: 'uid',
          composite: ['uid']
        },
        sk: {
          field: 'email',
          composite: ['email']
        }
      }
    }
  },
  { client: ddbDocClient, table: userTableName }
);
