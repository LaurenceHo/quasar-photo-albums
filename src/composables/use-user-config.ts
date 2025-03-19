import { DARK_MODE_ENABLED } from '@/utils/local-storage-key';
import { computed, ref } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { AuthService } from '@/services/auth-service.ts';
import type { UserPermission } from '@/schema';

const darkMode = ref(localStorage.getItem(DARK_MODE_ENABLED) === 'true');
const userState = ref<UserPermission | null>(null);

export default function useUserConfig() {
  const isEnabled = ref(false);
  const getDarkMode = computed(() => darkMode.value);
  const isAdmin = computed(() => userState.value?.role === 'admin');

  const { isFetching, data: userData } = useQuery({
    queryKey: ['getUserInfo'],
    queryFn: AuthService.userInfo,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: isEnabled,
  });

  const getUserPermission = computed(() => {
    if (userData.value?.data) {
      userState.value = userData.value.data;
    }
    return userState.value;
  });

  const setUserPermission = (user: UserPermission) => {
    userState.value = user;
  };

  const setDarkMode = (mode: boolean) => {
    darkMode.value = mode;
    localStorage.setItem(DARK_MODE_ENABLED, mode ? 'true' : 'false');
  };

  const setEnabled = (value: boolean) => {
    isEnabled.value = value;
  };

  return {
    isFetching,
    isAdmin,
    userPermission: getUserPermission,
    darkMode: getDarkMode,
    setUserPermission,
    setDarkMode,
    setEnabled,
  };
}
