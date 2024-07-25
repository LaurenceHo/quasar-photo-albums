import { app } from './app.js';
import { initialiseDynamodbTables } from './services/initialise-dynamodb-tables.js';
import { initialiseS3Bucket } from './services/initialise-s3-bucket.js';

await initialiseS3Bucket();
console.log('Finish verifying S3 bucket.');

await initialiseDynamodbTables();
console.log('Finish verifying DynamoDB tables.');

await app.listen({ port: 3000 });
console.log('App is listening on port 3000.🚀🚀🚀');
