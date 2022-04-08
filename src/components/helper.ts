export const getS3Url = (photoKey: string): string => {
  let photoLink = `https://s3.amazonaws.com/${process.env.AWS_S3_BUCKET_NAME}/${photoKey}`;
  // Replace space with "+" for retrieving file from S3
  photoLink = photoLink.replace(' ', '+');
  return photoLink;
};
