import { S3Client, waitUntilBucketExists } from '@aws-sdk/client-s3';
import fs from 'node:fs';
import logger from 'pino';
import { uploadObject } from '../controllers/helpers.js';
import { configuration } from './config.js';
import S3Service from './s3-service.js';

const s3Client = new S3Client(configuration);
const s3BucketName = process.env['AWS_S3_BUCKET_NAME'];
const s3Service = new S3Service();

export const initialiseS3Bucket = async () => {
  let ifBucketExists;
  try {
    ifBucketExists = await s3Service.checkIfBucketExists({ Bucket: s3BucketName });
    if (ifBucketExists) {
      logger().info(`Bucket ${s3BucketName} is ready.`);
    } else {
      await waitUntilBucketExists({ client: s3Client, maxWaitTime: 20 }, { Bucket: s3BucketName });
      logger().info(`Bucket ${s3BucketName} is finally ready.`);
    }
  } catch (err) {
    logger().error(err);
    throw Error(
      `Bucket ${s3BucketName} does not exist. Please run 'bun run cdk:deploy' first.`,
    );
  }

  const exists = await s3Service.checkIfFileExists({
    Bucket: s3BucketName,
    Key: 'updateDatabaseAt.json',
  });
  if (!exists) {
    fs.readFile('./assets/example_photo1.webp', async (err, data) => {
      if (err) {
        throw err;
      }
      await uploadObject('test-album-1/example_photo1.webp', data);
      logger().info(`Example photo 1 uploaded to ${s3BucketName} bucket.`);
    });

    fs.readFile('./assets/example_photo2.webp', async (err, data) => {
      if (err) {
        throw err;
      }
      await uploadObject('test-album-1/example_photo2.webp', data);
      logger().info(`Example photo 2 uploaded to ${s3BucketName} bucket.`);
    });

    await uploadObject('updateDatabaseAt.json', JSON.stringify({ time: new Date().toISOString() }));
    logger().info(`Uploaded updateDatabaseAt.json to ${s3BucketName} bucket.`);
  }
};
