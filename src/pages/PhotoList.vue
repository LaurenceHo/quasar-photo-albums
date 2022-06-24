<template>
  <div class="q-pt-md">
    <div class="row items-center">
      <q-btn color="primary" icon="mdi-arrow-left" round size="md" unelevated to="/" />
      <div class="text-h4 q-py-md q-pl-sm" data-test-id="album-name">
        {{ albumItem?.albumName }} {{ albumItem?.private ? '(private album)' : '' }}
      </div>
    </div>
    <div class="text-h6 text-grey q-pb-md" data-test-id="album-desc">{{ albumItem?.desc }}</div>
    <div v-if="albumItem?.tags?.length > 0" class="flex q-pb-md">
      <q-chip v-for="(tag, i) in albumItem.tags" :key="i" data-test-id="album-tag">
        {{ tag }}
      </q-chip>
    </div>
    <div v-if="photosInAlbum.length > 0" class="q-col-gutter-md row items-start">
      <div
        v-for="(photo, index) in photosInAlbum"
        :key="photo.key"
        class="col-xl-2 col-lg-2 col-md-3 col-sm-4 col-xs-6"
        data-test-id="photo-item"
      >
        <div class="relative-position">
          <q-img
            :ratio="1"
            :src="`${photo.url}?tr=w-250,h-250`"
            class="rounded-borders-lg cursor-pointer"
            @click="showLightBox(index)"
          />
          <q-btn
            v-if="userPermission.role === 'admin'"
            class="absolute-top-right"
            color="white"
            flat
            icon="mdi-link-variant"
            round
            @click="copyPhotoLink(photo.key)"
          />
        </div>
      </div>
    </div>
    <template v-else-if="photosInAlbum.length === 0 && !isLoadingPhotos">
      <div class="full-width" style="height: 60vh">
        <div v-if="userPermission.role === 'admin'" id="file-upload-container">
          <DropZone class="drop-area" @files-dropped="addFiles" #default="{ dropZoneActive }">
            <label for="file-input">
              <span v-if="dropZoneActive">
                <span>Drop Them Here</span>
                <span class="smaller">to add them</span>
              </span>
              <span v-else>
                <span>Drag Your Files Here</span>
                <span class="smaller">
                  or <strong><em>click here</em></strong> to select files
                </span>
              </span>

              <input type="file" id="file-input" multiple @change="onInputChange" />
            </label>
            <ul class="image-list" v-show="files.length">
              <FilePreview v-for="file of files" :key="file.id" :file="file" tag="li" @remove="removeFile" />
            </ul>
          </DropZone>
          <div class="flex q-pt-lg justify-center">
            <q-btn outline rounded color="accent" size="lg" padding="sm xl" @click="clearFiles" class="q-mr-md">
              Clear all
            </q-btn>

            <q-btn unelevated rounded color="accent" size="lg" padding="sm xl" @click.prevent="uploadFiles(files)">
              Upload
            </q-btn>
          </div>
        </div>
        <h6 v-else class="text-center">No photo in this album</h6>
      </div>
    </template>
  </div>
  <PhotoDetailDialog
    v-if="getPhotoDetailDialogState"
    :photos-in-album="photosInAlbum"
    :selected-image-index="selectedImageIndex"
  />
</template>

<script lang="ts" setup>
import PhotoDetailDialog from 'components/dialog/PhotoDetailDialog.vue';
import DropZone from 'components/file-uploader/DropZone.vue';
import FilePreview from 'components/file-uploader/FilePreview.vue';
import { copyToClipboard, useQuasar } from 'quasar';
import { createUploader, getS3Url } from 'src/components/helper';
import { Album, Photo } from 'src/components/models';
import DialogStateComposable from 'src/composables/dialog-state-composable';
import useFileList from 'src/composables/file-list-composable';
import PhotoService from 'src/services/photo-service';
import { albumStore } from 'src/stores/album-store';
import { UserPermission, userStore } from 'src/stores/user-store';
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const photoService = new PhotoService();
const q = useQuasar();
const route = useRoute();
const router = useRouter();
const { files, addFiles, removeFile } = useFileList();

const store = albumStore();
const userPermissionStore = userStore();
const { getPhotoDetailDialogState, setPhotoDetailDialogState } = DialogStateComposable();

const selectedImageIndex = ref(-1);
const photosInAlbum = ref([] as Photo[]);
const isLoadingPhotos = ref(false);

const userPermission = computed(() => userPermissionStore.userPermission as UserPermission);
const albumId = computed(() => route.params.albumId as string);
const albumItem = computed(() => store.getAlbumById(albumId.value) as Album);
const getPhotoList = async () => {
  isLoadingPhotos.value = true;
  photosInAlbum.value = [];
  if (albumItem.value?.id) {
    photosInAlbum.value = await photoService.getPhotosByAlbumId(albumItem.value.id);
  }
  isLoadingPhotos.value = false;
};

getPhotoList();

if (!albumItem.value) {
  q.notify({
    timeout: 4000,
    progress: true,
    color: 'negative',
    icon: 'mdi-alert-circle-outline',
    message: "Album doesn't exist. You will be redirected to the home page in 5 seconds",
  });
  setTimeout(() => router.push('/#activities'), 5000);
}

const { uploadFiles } = createUploader(albumId.value);

const showLightBox = (imageIndex: number) => {
  setPhotoDetailDialogState(true);
  selectedImageIndex.value = imageIndex;
};

const copyPhotoLink = (photoKey: string) => {
  const photoLink = getS3Url(photoKey);
  copyToClipboard(photoLink).then(() => {
    q.notify({
      color: 'white',
      textColor: 'dark',
      message: `<strong>Photo link copied!</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${photoLink}`,
      position: 'top',
      html: true,
      timeout: 3000,
    });
  });
};

const onInputChange = (e: any) => {
  addFiles(e.target.files);
  e.target.value = null; // reset so that selecting the same file again will still cause it to fire this change
};

const clearFiles = () => (files.value = []);

watch(albumId, (newValue) => {
  if (newValue) {
    getPhotoList();
    clearFiles();
  }
});
</script>
<style lang="scss" scoped>
#file-upload-container {
  text-align: center;
  color: #2c3e50;
  margin: 0 auto;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.drop-area {
  width: 100%;
  max-width: 1080px;
  margin: 0 auto;
  padding: 50px;
  background: #ffffff55;
  border-radius: 8px;
  border: 1px solid #ef6692;
  transition: 0.2s ease;

  &[data-active='true'] {
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    background: #ffffffcc;
  }
}

label {
  font-size: 36px;
  cursor: pointer;
  display: block;

  span {
    display: block;
  }

  input[type='file']:not(:focus-visible) {
    position: absolute !important;
    width: 1px !important;
    height: 1px !important;
    padding: 0 !important;
    margin: -1px !important;
    overflow: hidden !important;
    clip: rect(0, 0, 0, 0) !important;
    white-space: nowrap !important;
    border: 0 !important;
  }

  .smaller {
    font-size: 16px;
  }
}

.image-list {
  display: flex;
  list-style: none;
  flex-wrap: wrap;
  padding: 0;
}

button {
  cursor: pointer;
}
</style>
