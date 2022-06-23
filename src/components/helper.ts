export const getS3Url = (photoKey: string): string => {
  photoKey = photoKey.replace(' ', '+');
  return `https://s3.amazonaws.com/${process.env.AWS_S3_BUCKET_NAME}/${photoKey}`;
};

export const uploadFile = async (file: any, url: string) => {
  // set up the request data
  const formData = new FormData();
  formData.append('file', file.file);

  // track status and upload file
  file.status = 'loading';
  const response = await fetch(url, { method: 'POST', body: formData });

  // change status to indicate the success of the upload request
  file.status = response.ok;

  return response;
};

export const uploadFiles = (files: any, url: string) => {
  return Promise.all(files.map((file: any) => uploadFile(file, url)));
};

export const createUploader = (url: string) => ({
  uploadFile: (file: any) => uploadFile(file, url),
  uploadFiles: (files: any) => uploadFiles(files, url),
});
