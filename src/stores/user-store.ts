import { UserPermission } from 'components/models';
import { defineStore } from 'pinia';
import { Loading } from 'quasar';
import AuthService from 'src/services/auth-service';

export interface UserState {
  userPermission: UserPermission;
  isCheckingUserPermission: boolean;
}

const authService = new AuthService();

const initialState: UserState = {
  userPermission: {
    uid: '',
    email: '',
    role: '',
    displayName: '',
  },
  isCheckingUserPermission: false,
};

export const userStore = defineStore('user-permission', {
  state: () => initialState,
  getters: {
    isAdminUser: (state: UserState) => state.userPermission.role === 'admin',
  },
  actions: {
    async checkUserPermission() {
      try {
        Loading.show();
        this.isCheckingUserPermission = true;
        const response = await authService.getUserInfo();
        if (response && response.status !== 'Unauthorized' && response.data) {
          this.userPermission = response.data;
        }
      } catch (error: any) {
        console.error(error);
      } finally {
        Loading.hide();
        this.isCheckingUserPermission = false;
      }
    },
    setUserPermission(userPermission: UserPermission) {
      this.userPermission = userPermission;
    },
  },
});
