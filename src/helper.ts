import { LocalStorage } from 'quasar';

export const getStaticFileUrl = (objectKey: string): string => {
  return `${process.env.STATIC_FILES_URL}/${objectKey}`;
};

export const compareDbUpdatedTime = async () => {
  const response = await fetch(getStaticFileUrl('updateDatabaseAt.json'));
  const dbUpdatedTimeJSON = await response.json();
  // Updated time from s3
  const { time } = dbUpdatedTimeJSON;
  const localDbUpdatedTime = LocalStorage.getItem('DB_UPDATED_TIME');
  return {
    isLatest: localDbUpdatedTime === time,
    time,
  };
};

export const sortByKey = (array: any[], key: string, sorting: 'asc' | 'desc') => {
  return array.sort((a, b) => {
    if (a[key] instanceof String) {
      return sorting === 'asc' ? a[key].localeCompare(b[key]) : b[key].localeCompare(a[key]);
    }

    if (a[key] instanceof Number) {
      return sorting === 'asc' ? a[key] - b[key] : b[key] - a[key];
    }
  });
};
