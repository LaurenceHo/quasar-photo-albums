import { Notify } from 'quasar';
import PhotoService from 'src/services/photo-service';
import { ref } from 'vue';

const isUploading = ref(false);
const isCompleteUploading = ref(false);

export default function () {
  const setIsCompleteUploading = (state: boolean) => {
    isCompleteUploading.value = state;
  };

  const uploadFile = async (file: any, albumId: string) => {
    const photoService = new PhotoService();
    file.status = 'loading';
    let response;
    if (file.id.includes('image')) {
      response = await photoService.uploadPhotos(file.file, albumId);
      file.status = response.status === 'Success';
    } else {
      file.status = false;
    }
    return response;
  };

  const uploadFiles = (files: any, albumId: string) => {
    isUploading.value = true;
    isCompleteUploading.value = false;
    return Promise.all(files.map((file: any) => uploadFile(file, albumId))).then(() => {
      isUploading.value = false;
      isCompleteUploading.value = true;
      Notify.create({
        color: 'positive',
        message: 'Upload finished.',
        position: 'top',
        icon: 'mdi-check-circle-outline',
      });
    });
  };

  const createUploader = (albumId: string) => ({
    uploadFile: (file: any) => uploadFile(file, albumId),
    uploadFiles: (files: any) => uploadFiles(files, albumId),
  });

  return { setIsCompleteUploading, createUploader, isUploading, isCompleteUploading };
}
