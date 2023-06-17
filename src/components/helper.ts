export const getS3Url = (photoKey: string): string => {
  return `${process.env.STATIC_FILES_URL}/${photoKey}`
};
