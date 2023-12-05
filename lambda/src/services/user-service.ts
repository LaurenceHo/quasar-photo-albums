import { UserPermission } from '../models';
import { DynamoDbService } from './dynamo-db-service';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import get from 'lodash/get';

const PHOTO_USER_PERMISSION_TABLE_NAME = process.env.PHOTO_USER_PERMISSION_TABLE_NAME;

export default class UserService extends DynamoDbService<UserPermission> {
  constructor() {
    super();
  }

  async queryUserPermissionByUid(uid: string) {
    const params = {
      TableName: PHOTO_USER_PERMISSION_TABLE_NAME,
      ExpressionAttributeValues: {
        ':uid': uid,
      },
      KeyConditionExpression: 'uid = :uid',
    };
    const response = await this.client.send(new QueryCommand(params));
    return get(response, 'Items[0]', null);
  }
}
