import { Notify } from 'quasar';

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

export const fetchDbUpdatedTime = async () => {
  let dbUpdatedTimeJSON: { time: string } = { time: '' };
  try {
    const response = await fetch(getStaticFileUrl('updateDatabaseAt.json'));
    dbUpdatedTimeJSON = await response.json();
  } catch (error) {
    // Might encounter CORS issue. Do nothing
  }
  return dbUpdatedTimeJSON.time;
};

export const compareDbUpdatedTime = async (localDbUpdatedTime: string | null) => {
  // Get updated time from s3
  const time = await fetchDbUpdatedTime();
  return {
    isLatest: localDbUpdatedTime === time,
    dbUpdatedTime: time,
  };
};

export const sortByKey = <T>(array: T[], key: keyof T, sortOrder: 'asc' | 'desc'): T[] => {
  return array.sort((a, b) => {
    const aValue = a[key];
    const bValue = b[key];

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    } else if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    } else {
      return 0;
    }
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
