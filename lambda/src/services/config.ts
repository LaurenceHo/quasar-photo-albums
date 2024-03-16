import { DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import { S3ClientConfig } from '@aws-sdk/client-s3/dist-types/S3Client';
import dotenv from 'dotenv';

dotenv.config();

export const configuration = {
  region: process.env.AWS_REGION_NAME,
};

if (process.env.NODE_ENV === 'development') {
  (configuration as DynamoDBClientConfig | S3ClientConfig).credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  };
}
