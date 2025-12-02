import { initialiseS3Bucket } from './services/initialise-s3-bucket.js';

// Load environment variables (Bun does this automatically from .env, but explicit check doesn't hurt)
if (!process.env['AWS_S3_BUCKET_NAME']) {
  console.warn('AWS_S3_BUCKET_NAME is not set. Ensure .env file is present or variables are set.');
}

// Note: We don't need to import app here anymore as this script is standalone
// and uses S3Service directly.
console.log('Starting S3 bucket initialization...');
await initialiseS3Bucket();
console.log('S3 bucket initialization complete.');
