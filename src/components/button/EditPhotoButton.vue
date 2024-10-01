<template>
  <Button :class="extraClass" data-test-id="edit-photo-button" rounded severity="secondary" text @click="toggle">
    <template #icon>
      <IconDotsVertical :size="24" />
    </template>
  </Button>
  <Menu ref="menu" :model="items" :popup="true">
    <template #item="{ item }">
      <button class="flex items-center p-2">
        <component :is="item.icon" :size="24" />
        <span class="ml-2">{{ item.label }}</span>
      </button>
    </template>
  </Menu>
  <Toast position="top-center" />
</template>

<script lang="ts" setup>
import AlbumsContext from '@/composables/albums-context';
import DialogContext from '@/composables/dialog-context';
import PhotosContext from '@/composables/photos-context';
import type { Album } from '@/schema';
import { AlbumService } from '@/services/album-service';
import { getStaticFileUrl } from '@/utils/helper';
import { IconDotsVertical, IconEdit, IconFileExport, IconLink, IconPhotoStar, IconTrash } from '@tabler/icons-vue';
import Button from 'primevue/button';
import Menu from 'primevue/menu';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import { ref, toRefs } from 'vue';

const props = defineProps({
  extraClass: {
    type: String,
    default: ''
  },
  photoKey: {
    type: String,
    required: true
  }
});

const menu = ref();
const toast = useToast();
const { photoKey } = toRefs(props);

const { setSelectedPhotos, setCurrentPhotoToBeRenamed } = PhotosContext();
const { currentAlbum, fetchAlbumsByYear, setCurrentAlbum, isAlbumCover } = AlbumsContext();
const { setDeletePhotoDialogState, setMovePhotoDialogState, setRenamePhotoDialogState } = DialogContext();

const makeCoverPhoto = async () => {
  const albumToBeUpdated = { ...(currentAlbum.value as Album), albumCover: photoKey.value as string };
  const response = await AlbumService.updateAlbum(albumToBeUpdated);
  if (response.code === 200) {
    await fetchAlbumsByYear(albumToBeUpdated.year, true);
    setCurrentAlbum(albumToBeUpdated);
  }
};

const deletePhoto = () => {
  setSelectedPhotos([photoKey.value]);
  setDeletePhotoDialogState(true);
};

const movePhoto = () => {
  setSelectedPhotos([photoKey.value]);
  setMovePhotoDialogState(true);
};

const renamePhoto = () => {
  setCurrentPhotoToBeRenamed(photoKey.value);
  setRenamePhotoDialogState(true);
};

const copyPhotoLink = () => {
  const photoLink = getStaticFileUrl(photoKey.value);
  navigator.clipboard.writeText(photoLink).then(() => {
    toast.add({
      severity: 'secondary',
      summary: 'Photo link copied!',
      detail: photoLink,
      life: 2000
    });
  });
};

const toggle = (event: Event) => {
  menu.value.toggle(event);
};

const items = [
  {
    label: 'Copy Link',
    icon: IconLink,
    command: copyPhotoLink
  },
  {
    label: 'Delete Photo',
    icon: IconTrash,
    command: deletePhoto
  },
  {
    label: 'Move Photo',
    icon: IconFileExport,
    command: movePhoto
  },
  {
    label: 'Rename Photo',
    icon: IconEdit,
    command: renamePhoto
  },
  {
    label: 'Make Album Cover',
    icon: IconPhotoStar,
    command: makeCoverPhoto,
    visible: !isAlbumCover(photoKey.value)
  }
];
</script>
