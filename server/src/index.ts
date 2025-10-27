import logger from 'pino';
import { app } from './app.js';
import { initialiseDynamodbTables } from './services/initialise-dynamodb-tables.js';
import { initialiseS3Bucket } from './services/initialise-s3-bucket.js';

await initialiseS3Bucket();
logger().info('Finish verifying S3 bucket.');

await initialiseDynamodbTables();
logger().info('Finish verifying DynamoDB tables.');

await app.listen({ port: 3000 });
logger().info('App is listening on port 3000.');
