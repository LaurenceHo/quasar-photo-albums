import { DARK_MODE_ENABLED } from '@/utils/local-storage-key';
import { computed, ref } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { AuthService } from '@/services/auth-service.ts';
import type { UserPermission } from '@/schema';

const darkMode = ref(false);
const userState = ref<UserPermission | null>(null);

export default function UserConfigContext() {
  const { isFetching, data: userData } = useQuery({
    queryKey: ['getUserInfo'],
    enabled: !userState.value?.uid,
    queryFn: AuthService.userInfo,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity
  });

  const getUserPermission = computed(() => {
    if (userData.value?.data) {
      userState.value = userData.value.data;
    }
    return userState.value;
  });

  const getDarkMode = computed(() => darkMode.value);
  const isAdmin = computed(() => userState.value?.role === 'admin');

  const setUserPermission = (user: UserPermission) => {
    userState.value = user;
  };

  const setDarkMode = (mode: boolean) => {
    darkMode.value = mode;
    localStorage.setItem(DARK_MODE_ENABLED, mode ? 'true' : 'false');
  };

  return {
    isFetching,
    isAdmin,
    userPermission: getUserPermission,
    darkMode: getDarkMode,
    setUserPermission,
    setDarkMode
  };
}
