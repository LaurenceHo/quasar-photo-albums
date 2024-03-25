import { UserPermission } from '../models';
import { DynamodbService } from './dynamodb-service';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { get } from 'radash';

export default class UserService extends DynamodbService<UserPermission> {
  constructor() {
    super();
    this.tableName = process.env.PHOTO_USER_PERMISSION_TABLE_NAME;
  }

  async queryUserPermissionByUid(uid: string) {
    const params = {
      TableName: this.tableName,
      ExpressionAttributeValues: {
        ':uid': uid,
      },
      KeyConditionExpression: 'uid = :uid',
    };
    const response = await this.client.send(new QueryCommand(params));
    return get(response, 'Items[0]', null);
  }
}
