export const getStaticFileUrl = (objectKey: string): string => {
  return `${import.meta.env.VITE_STATIC_FILES_URL}/${objectKey}`;
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    dbUpdatedTime: time
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
