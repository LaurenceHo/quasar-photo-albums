import { Database } from '@cloudflare/d1';
import { UserPermission } from '../types/user-permission';
import { D1Service } from './d1-service';

const userPermissionTableName = 'user_permissions';

export default class UserService extends D1Service<UserPermission> {
  constructor(db: Database) {
    super(db, userPermissionTableName);
  }
}
