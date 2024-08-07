import PhotoService from 'src/services/photo-service';
import { UploadFile } from 'src/types';
import { notify } from 'src/utils/helper';
import { photoStore } from 'stores/photo-store';
import { ref } from 'vue';

const isUploading = ref(false);
const isCompleteUploading = ref(false);
const overwrite = ref(false);

export default function () {
  const usePhotoStore = photoStore();

  const setIsCompleteUploading = (state: boolean) => {
    isCompleteUploading.value = state;
  };

  const uploadFile = async (file: UploadFile, albumId: string) => {
    file.exists = usePhotoStore.findPhotoIndex(file.file.name) !== -1;
    const photoService = new PhotoService();
    file.status = 'loading';
    let response;
    if (file.id.includes('image') && (overwrite.value || (!overwrite.value && !file.exists))) {
      response = await photoService.uploadPhotos(file.file, albumId);
      file.status = response.status === 'Success';
    } else {
      file.status = false;
    }
    return response;
  };

  const uploadFiles = async (files: any, albumId: string) => {
    isUploading.value = true;
    isCompleteUploading.value = false;
    return Promise.all(files.map((file: any) => uploadFile(file, albumId))).then(() => {
      isUploading.value = false;
      isCompleteUploading.value = true;
      notify('positive', 'Upload finished.');
    });
  };

  const createUploader = (albumId: string) => ({
    uploadFile: (file: any) => uploadFile(file, albumId),
    uploadFiles: (files: any) => uploadFiles(files, albumId),
  });

  return { setIsCompleteUploading, createUploader, isUploading, isCompleteUploading, overwrite };
}
