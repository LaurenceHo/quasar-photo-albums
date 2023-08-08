import { defineStore } from 'pinia';
import { Loading } from 'quasar';
import AuthService from 'src/services/auth-service';

export interface UserPermission {
  uid: string;
  email: string;
  role: string;
  displayName: string;
}

export interface UserState {
  userPermission: UserPermission;
  isCheckingUserPermission: boolean;
}

const authService = new AuthService();

export const userStore = defineStore('user-permission', {
  state: () =>
    ({
      userPermission: {
        uid: '',
        email: '',
        role: '',
        displayName: '',
      },
      isCheckingUserPermission: true,
    }) as UserState,
  getters: {
    isAdminUser: (state: UserState) => state.userPermission.role === 'admin',
  },
  actions: {
    async checkUserPermission() {
      try {
        Loading.show();
        this.isCheckingUserPermission = true;
        const response = await authService.getUserInfo();
        if (response && response.status !== 'Unauthorized') {
          this.userPermission = response;
        }
      } catch (error: any) {
        console.log(error);
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
