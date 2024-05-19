import { LocalStorage, Notify } from 'quasar';

export const getStaticFileUrl = (objectKey: string): string => {
  return `${process.env.STATIC_FILES_URL}/${objectKey}`;
};

export const getYearOptions = () => {
  const yearOptions = ['na'];
  const currentYear = new Date().getFullYear();
  for (let i = currentYear; 2005 <= i; i--) {
    yearOptions.push(String(i));
  }
  return yearOptions;
};

export const compareDbUpdatedTime = async () => {
  const response = await fetch(getStaticFileUrl('updateDatabaseAt.json'));
  const dbUpdatedTimeJSON = await response.json();
  // Get updated time from s3
  const time = dbUpdatedTimeJSON.time ?? Date.now();
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

export const notify = (
  status: 'negative' | 'positive' | 'info' | 'warning',
  message: string,
  progress = false,
  position: Position = 'bottom',
  timeout: number = 2000
) => {
  Notify.create({
    progress,
    message,
    position,
    timeout,
    color: status,
    icon:
      status === 'negative'
        ? 'mdi-alert-circle'
        : status === 'positive'
          ? 'mdi-check-circle-outline'
          : status === 'warning'
            ? 'mdi-alert'
            : 'mdi-information',
  });
};
