import logger from 'pino';
import { initialiseS3Bucket } from './services/initialise-s3-bucket.js';

// Load environment variables (Bun does this automatically from .env, but explicit check doesn't hurt)
if (!process.env['AWS_S3_BUCKET_NAME']) {
  logger().warn('AWS_S3_BUCKET_NAME is not set. Ensure .env file is present or variables are set.');
}

logger().info('Starting S3 bucket initialization...');
await initialiseS3Bucket();
logger().info('S3 bucket initialization complete.');
