import { LocalStorage, Notify } from 'quasar';

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
    if (typeof a[key] === 'string') {
      return sorting === 'asc' ? a[key].localeCompare(b[key]) : b[key].localeCompare(a[key]);
    }

    if (typeof a[key] === 'number') {
      return sorting === 'asc' ? a[key] - b[key] : b[key] - a[key];
    }

    return 0;
  });
};

type Position =
  | 'top-left'
  | 'top'
  | 'top-right'
  | 'left'
  | 'center'
  | 'right'
  | 'bottom-left'
  | 'bottom'
  | 'bottom-right';

export const notifyError = (
  message: string,
  progress: boolean = false,
  position: Position = 'bottom',
  timeout: number = 2000
) => {
  Notify.create({
    progress,
    message,
    position,
    timeout,
    color: 'negative',
    icon: 'mdi-alert-circle',
  });
};
