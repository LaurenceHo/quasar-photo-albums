import type { UserPermission } from '@/schema';
import { DARK_MODE_ENABLED } from '@/utils/local-storage-key';
import { computed, ref } from 'vue';

const initialState: UserPermission = {
  uid: '',
  email: '',
  role: '',
  displayName: ''
};

const darkMode = ref(false);
const userPermission = ref(initialState);

export default function UserConfigContext() {
  const getUserPermission = computed(() => userPermission.value);
  const getDarkMode = computed(() => darkMode.value);
  const isAdmin = computed(() => userPermission.value?.role === 'admin');

  const setUserPermission = (user: UserPermission) => {
    userPermission.value = user;
  };

  const setDarkMode = (mode: boolean) => {
    darkMode.value = mode;
    localStorage.setItem(DARK_MODE_ENABLED, mode ? 'true' : 'false');
  };

  return {
    isAdmin,
    userPermission: getUserPermission,
    darkMode: getDarkMode,
    setUserPermission,
    setDarkMode
  };
}
