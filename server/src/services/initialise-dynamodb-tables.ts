import { CreateTableCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import { AlbumTag, AlbumTagEntity, albumTagsTableName, albumTagsTableSchema } from '../schemas/album-tag.js';
import { Album, AlbumEntity, albumTableName, albumTableSchema } from '../schemas/album.js';
import {
  UserPermission,
  UserPermissionEntity,
  userPermissionTableSchema,
  userTableName,
} from '../schemas/user-permission.js';
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
    console.log(`${tableName} table is active`);
    cb(true);
  }
};

const initialiseAlbumTable = async () => {
  let albumTableResponse;
  try {
    albumTableResponse = await getTableStatus(albumTableName);
  } catch (error) {
    // DO NOTHING
  }

  if (!albumTableResponse?.Table) {
    console.log(`${albumTableName} table does not exist. Creating table......`);
    try {
      await ddbDocClient.send(new CreateTableCommand(albumTableSchema));
      console.log(`${albumTableName} table created.`);

      await waitForTable(albumTableName, async (value) => {
        if (value) {
          console.log(`Īnsert mock data into ${albumTableName} table......`);
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
      });
    } catch (error) {
      console.error(`Error creating ${albumTableName}:`, error);
    }
  } else {
    console.log(`${albumTableName} table exists.👍`);
  }
};

const initialiseAlbumTagsTable = async () => {
  let response;
  try {
    response = await getTableStatus(albumTagsTableName);
  } catch (error) {
    // DO NOTHING
  }

  if (!response?.Table) {
    console.log(`${albumTagsTableName} table does not exist. Creating table......`);
    try {
      await ddbDocClient.send(new CreateTableCommand(albumTagsTableSchema));
      console.log(`${albumTagsTableName} table created.`);

      await waitForTable(albumTagsTableName, async (value) => {
        if (value) {
          console.log(`Īnsert mock data into ${albumTagsTableName} table......`);
          await AlbumTagEntity.create({
            tag: 'test-tag-1',
          } as AlbumTag).go({ response: 'none' });
          console.log(`Mock data inserted into ${albumTagsTableName} table.`);
        }
      });
    } catch (error) {
      console.error(`Error creating ${albumTagsTableName}:`, error);
    }
  } else {
    console.log(`${albumTagsTableName} table exists.👍`);
  }
};

const initialiseUserTable = async () => {
  let response;
  try {
    response = await getTableStatus(userTableName);
  } catch (error) {
    // DO NOTHING
  }

  if (!response?.Table) {
    console.log(`${userTableName} table does not exist. Creating table......`);
    try {
      await ddbDocClient.send(new CreateTableCommand(userPermissionTableSchema));
      console.log(`${userTableName} table created.`);

      await waitForTable(userTableName, async (value) => {
        if (value) {
          console.log(`Īnsert mock data into ${userTableName} table......`);
          await UserPermissionEntity.create({
            uid: 'test-uid-1',
            email: 'test@example.com',
            displayName: 'Test User',
            role: 'admin',
          } as UserPermission).go({ response: 'none' });
          console.log(`Mock data inserted into ${userTableName} table.`);
        }
      });
    } catch (error) {
      console.error(`Error creating ${userTableName}:`, error);
    }
  } else {
    console.log(`${userTableName} table exists.👍`);
  }
};

export const initialiseDynamodbTables = async () => {
  console.log('Verifying DynamoDB tables......');

  await Promise.all([initialiseAlbumTable(), initialiseAlbumTagsTable(), initialiseUserTable()]);
};
