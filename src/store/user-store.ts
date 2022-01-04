import { defineStore } from 'pinia';
import { Loading, Notify } from 'quasar';
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
    } as UserState),
  actions: {
    async checkUserPermission() {
      try {
        Loading.show();
        this.isCheckingUserPermission = true;
        const userPermission = await authService.getUserInfo();
        if (userPermission) {
          this.userPermission = userPermission;
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
