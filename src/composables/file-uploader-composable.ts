import { Notify } from 'quasar';
import PhotoService from 'src/services/photo-service';
import { ref } from 'vue';

const isUploading = ref(false);
const isCompleteUploading = ref(false);

export default function () {
  const uploadFile = async (file: any, albumId: string) => {
    const photoService = new PhotoService();
    file.status = 'loading';
    const response = await photoService.uploadPhotos(file.file, albumId);

    file.status = response.status === 'Success';
    return response;
  };

  const uploadFiles = (files: any, albumId: string) => {
    isUploading.value = true;
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

  return { createUploader, isUploading, isCompleteUploading };
}
