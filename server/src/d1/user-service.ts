import { D1Service } from './d1-service';
import { UserPermission } from '../types/user-permission';

export default class UserService extends D1Service<UserPermission> {
  constructor(db: D1Database) {
    super(db, 'user_permissions');
  }
}
