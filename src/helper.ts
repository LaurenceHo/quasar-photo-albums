import { LocalStorage } from 'quasar';

export const getS3Url = (objectKey: string): string => {
  return `${process.env.STATIC_FILES_URL}/${objectKey}`;
};

export const compareDbUpdatedTime = async () => {
  const response = await fetch(getS3Url('updateDatabaseAt.json'));
  const dbUpdatedTimeJSON = await response.json();
  // Updated time from s3
  const { time } = dbUpdatedTimeJSON;
  const localDbUpdatedTime = LocalStorage.getItem('DB_UPDATED_TIME');
  return {
    isLatest: localDbUpdatedTime === time,
    time,
  };
};
