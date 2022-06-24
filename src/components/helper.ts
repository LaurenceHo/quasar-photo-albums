import PhotoService from 'src/services/photo-service';

export const getS3Url = (photoKey: string): string => {
  photoKey = photoKey.replace(' ', '+');
  return `https://s3.amazonaws.com/${process.env.AWS_S3_BUCKET_NAME}/${photoKey}`;
};

export const uploadFile = async (file: any, albumId: string) => {
  const photoService = new PhotoService();
  file.status = 'loading';
  const response = await photoService.uploadPhotos(file.file, albumId);

  file.status = response.status === 'Success';

  return response;
};

export const uploadFiles = (files: any, albumId: string) => {
  return Promise.all(files.map((file: any) => uploadFile(file, albumId)));
};

export const createUploader = (albumId: string) => ({
  uploadFile: (file: any) => uploadFile(file, albumId),
  uploadFiles: (files: any) => uploadFiles(files, albumId),
});
