export const ApiBaseUrl =
  import.meta.env.MODE === 'MSW'
    ? '/api'
    : import.meta.env.DEV
      ? 'http://localhost:3000/api'
      : import.meta.env.VITE_AWS_API_GATEWAY_URL;
