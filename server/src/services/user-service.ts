import { UserPermission, UserPermissionEntity } from '../schemas/user-permission.js';
import { DynamodbService } from './dynamodb-service.js';

export default class UserService extends DynamodbService<UserPermission> {
  constructor() {
    super();
    this.entity = UserPermissionEntity;
  }
}
