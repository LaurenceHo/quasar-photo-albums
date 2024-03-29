import { UserPermission, UserPermissionEntity, userTableName } from '../schemas/user-permission';
import { DynamodbService } from './dynamodb-service';

export default class UserService extends DynamodbService<UserPermission> {
  constructor() {
    super();
    this.tableName = userTableName;
    this.entity = UserPermissionEntity;
  }
}
