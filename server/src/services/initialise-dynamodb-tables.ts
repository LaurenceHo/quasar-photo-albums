import { DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import { AlbumTag, AlbumTagEntity, albumTagsTableName } from '../schemas/album-tag.js';
import { Album, AlbumEntity, albumTableName } from '../schemas/album.js';
import { UserPermission, UserPermissionEntity, userTableName } from '../schemas/user-permission.js';
import { ddbDocClient } from './dynamodb-client.js';

const getTableStatus = async (tableName: string) => {
  return await ddbDocClient.send(
    new DescribeTableCommand({
      TableName: tableName,
    })
  );
};

const waitForTable = async (tableName: string, cb: (value: boolean) => void) => {
  const tableDescription = await getTableStatus(tableName);

  if (tableDescription.Table?.TableStatus !== 'ACTIVE') {
    console.log(`Waiting for ${tableName} table to become active......`);
    setTimeout(() => waitForTable(tableName, cb), 5000);
  } else {
    cb(true);
  }
};

const initialiseAlbumTable = async () => {
  try {
    await getTableStatus(albumTableName);
  } catch (error) {
    console.error(error);
    throw Error(`Table ${albumTableName} does not exist. Please run 'bun run serverless:deploy' first.`);
  }

  try {
    console.log(`Checking ${albumTableName} has data......`);
    await waitForTable(albumTableName, async (value) => {
      if (value) {
        const items = await AlbumEntity.scan.go({ limit: 1, ignoreOwnership: true });
        if (items.data.length === 0) {
          console.log(`Insert mock data into ${albumTableName} table......`);
          await AlbumEntity.create({
            year: 'na',
            id: 'test-album-1',
            albumName: 'Test Album 1',
            description: 'This is a test album 1',
            albumCover: '',
            isPrivate: false,
            place: {
              displayName: 'Sydney',
              formattedAddress: 'Sydney NSW, Australia',
              location: {
                latitude: -33.8688,
                longitude: 151.2093,
              },
            } as any,
            tags: ['test-tag-1'],
            createdBy: 'System',
            updatedBy: 'System',
          } as Album).go({ response: 'none' });
          console.log(`Mock data inserted into ${albumTableName} table.`);
        }
      }
    });
    console.log(`${albumTableName} table all set.👍`);
  } catch (error) {
    console.error(`Error when checking ${albumTableName}:`, error);
  }
};

const initialiseAlbumTagsTable = async () => {
  try {
    await getTableStatus(albumTagsTableName);
  } catch (error) {
    console.error(error);
    throw Error(`Table ${albumTableName} does not exist. Please run 'bun run serverless:deploy' first.`);
  }

  try {
    console.log(`Checking ${albumTagsTableName} has data......`);
    await waitForTable(albumTagsTableName, async (value) => {
      if (value) {
        const items = await AlbumTagEntity.scan.go({ limit: 1, ignoreOwnership: true });
        if (items.data.length === 0) {
          console.log(`Insert mock data into ${albumTagsTableName} table......`);
          await AlbumTagEntity.create({
            tag: 'test-tag-1',
          } as AlbumTag).go({ response: 'none' });
          console.log(`Mock data inserted into ${albumTagsTableName} table.`);
        }
      }
    });
    console.log(`${albumTagsTableName} table all set.👍`);
  } catch (error) {
    console.error(`Error when checking ${albumTagsTableName}:`, error);
  }
};

const initialiseUserTable = async () => {
  try {
    await getTableStatus(userTableName);
  } catch (error) {
    console.error(error);
    throw Error(`Table ${albumTableName} does not exist. Please run 'bun run serverless:deploy' first.`);
  }

  try {
    console.log(`Checking ${userTableName} has data......`);
    await waitForTable(userTableName, async (value) => {
      if (value) {
        const items = await UserPermissionEntity.scan.go({ limit: 1, ignoreOwnership: true });
        if (items.data.length === 0) {
          console.log(`Insert mock data into ${userTableName} table......`);
          await UserPermissionEntity.create({
            uid: 'test-uid-1',
            email: 'test@example.com',
            displayName: 'Test User',
            role: 'admin',
          } as UserPermission).go({ response: 'none' });
          console.log(`Mock data inserted into ${userTableName} table.`);
        }
      }
    });
    console.log(`${userTableName} table all set.👍`);
  } catch (error) {
    console.error(`Error when checking ${userTableName}:`, error);
  }
};

export const initialiseDynamodbTables = async () => {
  console.log('Verifying DynamoDB tables......');

  await Promise.all([initialiseAlbumTable(), initialiseAlbumTagsTable(), initialiseUserTable()]);
};
