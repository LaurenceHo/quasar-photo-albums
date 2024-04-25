import { app } from './app.js';
import { initialiseDynamodbTables } from './services/initialise-dynamodb-tables.js';

try {
  initialiseDynamodbTables().then(() => console.log('Finish verifying DynamoDB tables.'));

  await app.listen({ port: 3000 });
  console.log('App is listening on port 3000.');
} catch (err) {
  console.error(err);
}
