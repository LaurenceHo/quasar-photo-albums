import dotenv from 'dotenv';
import { DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import { S3ClientConfig } from '@aws-sdk/client-s3/dist-types/S3Client';

dotenv.config();

export const configuration = {
  region: process.env.AWS_REGION,
};

if (process.env.NODE_ENV === 'development') {
  (configuration as DynamoDBClientConfig | S3ClientConfig).credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_KEY!,
  };
}
