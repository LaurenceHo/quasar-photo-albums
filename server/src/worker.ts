import { app } from './app.js';
import { Env, envStorage } from './env.js';

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    // Polyfill process.env for S3Client and other libraries
    if (env.AWS_S3_BUCKET_NAME) process.env['AWS_S3_BUCKET_NAME'] = env.AWS_S3_BUCKET_NAME;
    if (env.AWS_REGION_NAME) process.env['AWS_REGION_NAME'] = env.AWS_REGION_NAME;
    if (env.VITE_IMAGEKIT_CDN_URL) process.env['VITE_IMAGEKIT_CDN_URL'] = env.VITE_IMAGEKIT_CDN_URL;
    if (env.AWS_ACCESS_KEY_ID) process.env['AWS_ACCESS_KEY_ID'] = env.AWS_ACCESS_KEY_ID;
    if (env.AWS_SECRET_ACCESS_KEY) process.env['AWS_SECRET_ACCESS_KEY'] = env.AWS_SECRET_ACCESS_KEY;
    if (env.JWT_SECRET) process.env['JWT_SECRET'] = env.JWT_SECRET;
    if (env.GOOGLE_PLACES_API_KEY) process.env['GOOGLE_PLACES_API_KEY'] = env.GOOGLE_PLACES_API_KEY;
    if (env.VITE_GOOGLE_CLIENT_ID) process.env['VITE_GOOGLE_CLIENT_ID'] = env.VITE_GOOGLE_CLIENT_ID;
    if (env.ALBUM_URL) process.env['ALBUM_URL'] = env.ALBUM_URL;
    if (env.ENVIRONMENT) process.env['ENVIRONMENT'] = env.ENVIRONMENT;

    // Run within AsyncLocalStorage context
    return envStorage.run(env, async () => {
      await app.ready();

      const url = new URL(request.url);
      const injectHeaders: Record<string, string> = {};
      request.headers.forEach((value, key) => {
        injectHeaders[key] = value;
      });

      const response = await app.inject({
        method: request.method as any,
        url: url.pathname + url.search,
        headers: injectHeaders,
        payload: await request.text(),
      });

      const responseHeaders = new Headers();
      for (const [key, value] of Object.entries(response.headers)) {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach((v) => responseHeaders.append(key, v));
          } else {
            responseHeaders.append(key, String(value));
          }
        }
      }

      return new Response(response.body, {
        status: response.statusCode,
        headers: responseHeaders,
      });
    });
  },
};
