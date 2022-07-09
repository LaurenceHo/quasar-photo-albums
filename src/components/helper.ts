export const getS3Url = (photoKey: string): string => {
  photoKey = photoKey.replace(' ', '+');
  return `https://s3.amazonaws.com/${process.env.AWS_S3_BUCKET_NAME}/${photoKey}`;
};
