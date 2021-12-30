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
}

const authService = new AuthService();

export const userStore = defineStore('user-permission', {
  state: () =>
    ({
      userPermission: {},
    } as UserState),
  actions: {
    async checkUserPermission() {
      try {
        Loading.show();
        const userPermission = await authService.checkUser();
        if (userPermission) {
          this.userPermission = userPermission;
        } else {
          Notify.create({
            color: 'negative',
            icon: 'mdi-alert-circle-outline',
            message: "You don't have permission.",
          });
        }
      } catch (error) {
        Notify.create({
          color: 'negative',
          icon: 'mdi-alert-circle-outline',
          message: 'Unauthorized access. Please login.',
        });
      } finally {
        Loading.hide();
      }
    },
    setUserPermission(userPermission: UserPermission) {
      this.userPermission = userPermission;
    },
  },
});
