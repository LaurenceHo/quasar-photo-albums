import { UserPermission, UserPermissionEntity } from '../schemas/user-permission';
import { DynamodbService } from './dynamodb-service';

export default class UserService extends DynamodbService<UserPermission> {
  constructor() {
    super();
    this.entity = UserPermissionEntity;
  }
}
