import { app } from './app.js';
import { uploadObject } from './controllers/helpers.js';
import { initialiseDynamodbTables } from './services/initialise-dynamodb-tables.js';
import S3Service from './services/s3-service.js';

await initialiseDynamodbTables();
console.log('Finish verifying DynamoDB tables.');

const s3Service = new S3Service();

const exists = await s3Service.checkObject({ Bucket: process.env.AWS_S3_BUCKET_NAME, Key: 'updateDatabaseAt.json' });
if (!exists) {
  console.log('updateDatabaseAt.json does not exist');
  await uploadObject('updateDatabaseAt.json', JSON.stringify({ time: new Date().toISOString() }));
}

await app.listen({ port: 3000 });
console.log('App is listening on port 3000.🚀🚀🚀');
