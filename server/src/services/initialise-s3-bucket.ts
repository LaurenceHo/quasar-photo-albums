import { S3Client, waitUntilBucketExists } from '@aws-sdk/client-s3';
import fs from 'node:fs';
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
    console.log(`Bucket ${s3BucketName} is ready👍`);
  } catch (err) {
    console.error(err);
    throw Error(`Bucket ${s3BucketName} does not exist. Please run 'bun run serverless:deploy' first.`);
  }

  if (!ifBucketExists) {
    await waitUntilBucketExists({ client: s3Client, maxWaitTime: 20 }, { Bucket: s3BucketName });
    console.log(`Bucket ${s3BucketName} is ready👍`);
  }

  const exists = await s3Service.checkIfFileExists({
    Bucket: s3BucketName,
    Key: 'updateDatabaseAt.json',
  });
  if (!exists) {
    await uploadObject('test-album-1/example_photo1.webp', fs.readdirSync('../assets/example_photo1.webp'));
    await uploadObject('test-album-1/example_photo1.webp', fs.readdirSync('../assets/example_photo2.webp'));
    console.log(`Example photo uploaded to ${s3BucketName} bucket.`);

    await uploadObject('updateDatabaseAt.json', JSON.stringify({ time: new Date().toISOString() }));
    console.log(`Uploaded updateDatabaseAt.json to ${s3BucketName} bucket.`);
  }
};
