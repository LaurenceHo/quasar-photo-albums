<template>
  <Toolbar class="sticky top-0 z-50 !rounded-none">
    <template #start>
      <router-link class="flex items-center" to="/">
        <img alt="Website logo" class="logo" height="48" width="48" src="/logo.png" />
        <h1 class="hidden sm:block text-2xl font-bold">{{ appName }}</h1>
      </router-link>
    </template>

    <template #center>
      <IconField v-if="routeName === 'albumsByYear'" class="md:hidden right-0">
        <InputIcon>
          <IconSearch :size="20" />
        </InputIcon>
        <InputText v-model="albumSearchKey" placeholder="Search" />
      </IconField>
    </template>

    <template #end>
      <IconField v-if="routeName === 'albumsByYear'" class="hidden md:block">
        <InputIcon>
          <IconSearch :size="20" />
        </InputIcon>
        <InputText v-model="albumSearchKey" placeholder="Search" />
      </IconField>
      <template v-if="routeName !== 'login'">
        <Button
          :severity="routeName === 'albumsByYear' || routeName === 'photosByAlbum' ? 'primary' : 'secondary'"
          as="router-link"
          label="Photos"
          text
          to="/albums"
        >
          <template #icon>
            <IconLibraryPhoto :size="24" />
          </template>
        </Button>
        <Button
          :severity="routeName === 'albumMap' ? 'primary' : 'secondary'"
          as="router-link"
          label="Map"
          text
          to="/map/albums"
        >
          <template #icon>
            <IconMap2 :size="24" />
          </template>
        </Button>
      </template>
      <Button severity="secondary" text @click="toggleDarkMode">
        <template #icon>
          <template v-if="darkMode">
            <IconMoonStars :size="24" />
          </template>
          <template v-else>
            <IconSun :size="24" />
          </template>
        </template>
      </Button>
      <Button
        v-if="userPermission?.uid && routeName !== 'login'"
        :label="userPermission.displayName"
        aria-controls="overlay_menu"
        aria-haspopup="true"
        severity="secondary"
        text
        type="button"
        @click="toggle"
      >
        <template #icon>
          <IconUser :size="24" />
        </template>
      </Button>
      <Menu id="overlay_menu" ref="menu" :model="items" :popup="true">
        <template #item="{ item }">
          <button class="flex items-center p-2">
            <component :is="item.icon" :size="24" />
            <span class="ml-2">{{ item.label }}</span>
          </button>
        </template>
      </Menu>
    </template>
  </Toolbar>
  <div v-if="isFetching" class="flex items-center justify-center min-h-[90vh]">
    <ProgressSpinner />
  </div>
  <template v-else>
    <router-view />
  </template>
</template>
<script lang="ts" setup>
import useAlbums from '@/composables/use-albums';
import useDialog from '@/composables/use-dialog';
import useUserConfig from '@/composables/use-user-config';
import { AuthService } from '@/services/auth-service';
import { DARK_MODE_ENABLED } from '@/utils/local-storage-key';
import {
  IconFolderPlus,
  IconLibraryPhoto,
  IconLogout,
  IconMap2,
  IconMoonStars,
  IconSearch,
  IconSun,
  IconTags,
  IconUser
} from '@tabler/icons-vue';
import Button from 'primevue/button';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';
import Menu from 'primevue/menu';
import ProgressSpinner from 'primevue/progressspinner';
import Toolbar from 'primevue/toolbar';
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const routeName = computed(() => route.name);
const { albumSearchKey } = useAlbums();
const { isFetching, userPermission, darkMode, setDarkMode } = useUserConfig();
const { setUpdateAlbumDialogState, setUpdateAlbumTagsDialogState } = useDialog();
const appName = import.meta.env.VITE_ALBUM_APP_TITLE;
const title = document.getElementsByTagName('title')?.[0];
if (title) {
  title.innerHTML = appName;
}

const menu = ref();
const items = ref([
  {
    label: 'New Album',
    icon: IconFolderPlus as any,
    visible: () => routeName.value === 'albumsByYear',
    command: () => setUpdateAlbumDialogState(true)
  },
  {
    label: 'Manage Album Tags',
    icon: IconTags as any,
    visible: () => routeName.value === 'albumsByYear',
    command: () => setUpdateAlbumTagsDialogState(true)
  },
  {
    label: 'Logout',
    icon: IconLogout as any,
    command: () =>
      AuthService.logout().then(() => {
        localStorage.clear();
        location.reload();
      })
  }
]);

const toggle = (event: any) => {
  menu.value.toggle(event);
};

const toggleDarkMode = () => {
  const element = document.querySelector('html');
  if (element) {
    element.classList.toggle('dark-theme');
  }
  setDarkMode(!darkMode.value);
};

const isDarkModeEnabled = () => {
  const storedDarkMode = localStorage.getItem(DARK_MODE_ENABLED);

  if (storedDarkMode !== null) {
    return setDarkModeAndAddClass(storedDarkMode === 'true');
  }

  if (typeof window !== 'undefined' && window.matchMedia) {
    return setDarkModeAndAddClass(window.matchMedia('(prefers-color-scheme: dark)').matches);
  }

  throw new Error('matchMedia is not supported');
};

const setDarkModeAndAddClass = (isDarkMode: boolean) => {
  if (isDarkMode) {
    document.querySelector('html')?.classList.add('dark-theme');
  }
  setDarkMode(isDarkMode);
  return isDarkMode;
};

isDarkModeEnabled();
</script>
