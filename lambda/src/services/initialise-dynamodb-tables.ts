import { CreateTableCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { Album, AlbumTag, UserPermission } from '../models';
import { ddbDocClient } from './dynamodb-client';

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
  const albumTableName = process.env.PHOTO_ALBUMS_TABLE_NAME || 'photo-albums';

  let albumTableResponse;
  try {
    albumTableResponse = await getTableStatus(albumTableName);
  } catch (error) {
    // DO NOTHING
  }

  if (!albumTableResponse?.Table) {
    console.log(`${albumTableName} table does not exist. Creating table......`);
    try {
      await ddbDocClient.send(
        new CreateTableCommand({
          AttributeDefinitions: [
            {
              AttributeName: 'id',
              AttributeType: 'S',
            },
          ],
          KeySchema: [
            {
              AttributeName: 'id',
              KeyType: 'HASH',
            },
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          },
          TableName: albumTableName,
        })
      );
      console.log(`${albumTableName} table created.`);

      await waitForTable(albumTableName, async (value) => {
        if (value) {
          console.log(`Īnsert mock data into ${albumTableName} table......`);
          await ddbDocClient.send(
            new PutCommand({
              TableName: albumTableName,
              Item: {
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
                },
                tags: ['test-tag-1'],
                createdAt: new Date().toISOString(),
                createdBy: 'System',
                updatedAt: new Date().toISOString(),
                updatedBy: 'System',
                order: 1,
              } as Album,
            })
          );
          console.log(`Mock data inserted into ${albumTableName} table.`);
        }
      });
    } catch (error) {
      console.error(`Error creating ${albumTableName}:`, error);
    }
  }
};

const initialiseAlbumTagsTable = async () => {
  const albumTagsTableName = process.env.PHOTO_ALBUM_TAGS_TABLE_NAME || 'photo-album-tags';

  let response;
  try {
    response = await getTableStatus(albumTagsTableName);
  } catch (error) {
    // DO NOTHING
  }

  if (!response?.Table) {
    console.log(`${albumTagsTableName} table does not exist. Creating table......`);
    try {
      await ddbDocClient.send(
        new CreateTableCommand({
          AttributeDefinitions: [
            {
              AttributeName: 'tag',
              AttributeType: 'S',
            },
          ],
          KeySchema: [
            {
              AttributeName: 'tag',
              KeyType: 'HASH',
            },
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          },
          TableName: albumTagsTableName,
        })
      );
      console.log(`${albumTagsTableName} table created.`);

      await waitForTable(albumTagsTableName, async (value) => {
        if (value) {
          console.log(`Īnsert mock data into ${albumTagsTableName} table......`);
          await ddbDocClient.send(
            new PutCommand({
              TableName: albumTagsTableName,
              Item: {
                tag: 'test-tag-1',
              } as AlbumTag,
            })
          );
          console.log(`Mock data inserted into ${albumTagsTableName} table.`);
        }
      });
    } catch (error) {
      console.error(`Error creating ${albumTagsTableName}:`, error);
    }
  }
};

const initialiseUserTable = async () => {
  const userTableName = process.env.PHOTO_USER_PERMISSION_TABLE_NAME || 'user-permission';

  let response;
  try {
    response = await getTableStatus(userTableName);
  } catch (error) {
    // DO NOTHING
  }

  if (!response?.Table) {
    console.log(`${userTableName} table does not exist. Creating table......`);
    try {
      await ddbDocClient.send(
        new CreateTableCommand({
          AttributeDefinitions: [
            {
              AttributeName: 'uid',
              AttributeType: 'S',
            },
            {
              AttributeName: 'email',
              AttributeType: 'S',
            },
          ],
          KeySchema: [
            {
              AttributeName: 'uid',
              KeyType: 'HASH',
            },
            {
              AttributeName: 'email',
              KeyType: 'RANGE',
            },
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          },
          TableName: userTableName,
        })
      );
      console.log(`${userTableName} table created.`);

      await waitForTable(userTableName, async (value) => {
        if (value) {
          console.log(`Īnsert mock data into ${userTableName} table......`);
          await ddbDocClient.send(
            new PutCommand({
              TableName: userTableName,
              Item: {
                uid: 'test-uid-1',
                email: 'test@example.com',
                displayName: 'Test User',
                role: 'admin',
              } as UserPermission,
            })
          );
          console.log(`Mock data inserted into ${userTableName} table.`);
        }
      });
    } catch (error) {
      console.error(`Error creating ${userTableName}:`, error);
    }
  }
};

export const initialiseDynamodbTables = async () => {
  console.log('Verifying DynamoDB tables......');

  await Promise.all([initialiseAlbumTable(), initialiseAlbumTagsTable(), initialiseUserTable()]);
};
