import PhotosContext from '@/composables/photos-context';
import { PhotoService } from '@/services/photo-service';
import type { UploadFile } from '@/schema';
import { ref } from 'vue';

const isUploading = ref(false);
const isCompleteUploading = ref(false);
const overwrite = ref(false);

export default function FileUploaderContext() {
  const { findPhotoIndex } = PhotosContext();

  const setIsCompleteUploading = (state: boolean) => {
    isCompleteUploading.value = state;
  };

  const uploadFile = async (file: UploadFile, albumId: string) => {
    file.exists = findPhotoIndex(file.file.name) !== -1;
    file.status = 'loading';
    let response;
    if (file.id.includes('image') && (overwrite.value || (!overwrite.value && !file.exists))) {
      response = await PhotoService.uploadPhotos(file.file, albumId);
      file.status = response.status === 'Success';
    } else {
      file.status = false;
    }
    return response;
  };

  const uploadFiles = async (files: UploadFile[], albumId: string) => {
    isUploading.value = true;
    isCompleteUploading.value = false;

    return Promise.all(files.map((file: UploadFile) => uploadFile(file, albumId))).then(() => {
      isUploading.value = false;
      isCompleteUploading.value = true;
    });
  };

  const createUploader = (albumId: string) => ({
    uploadFile: (file: UploadFile) => uploadFile(file, albumId),
    uploadFiles: (files: UploadFile[]) => uploadFiles(files, albumId),
  });

  return { setIsCompleteUploading, createUploader, isUploading, isCompleteUploading, overwrite };
}
