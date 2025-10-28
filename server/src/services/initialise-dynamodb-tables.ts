import { DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import logger from 'pino';
import { AlbumTag, AlbumTagEntity, albumTagsTableName } from '../schemas/album-tag.js';
import { Album, AlbumEntity, albumTableName } from '../schemas/album.js';
import { ddbDocClient } from './dynamodb-client.js';

const getTableStatus = async (tableName: string) => {
  return await ddbDocClient.send(
    new DescribeTableCommand({
      TableName: tableName,
    }),
  );
};

const waitForTable = async (tableName: string, cb: (value: boolean) => void) => {
  const tableDescription = await getTableStatus(tableName);

  if (tableDescription.Table?.TableStatus !== 'ACTIVE') {
    logger().info(`Waiting for ${tableName} table to become active......`);
    setTimeout(() => waitForTable(tableName, cb), 5000);
  } else {
    cb(true);
  }
};

const initialiseAlbumTable = async () => {
  try {
    await getTableStatus(albumTableName);
  } catch (error) {
    logger().error(error);
    throw Error(`Table ${albumTableName} does not exist. Please run 'bun run cdk:deploy' first.`);
  }

  try {
    logger().info(`Checking ${albumTableName} has data......`);
    await waitForTable(albumTableName, async (value) => {
      if (value) {
        const items = await AlbumEntity.scan.go({ limit: 1, ignoreOwnership: true });
        if (items.data.length === 0) {
          logger().info(`Insert mock data into ${albumTableName} table......`);
          await AlbumEntity.create({
            year: 'na',
            id: 'test-album-1',
            albumName: 'Test Album 1',
            description: 'This is a test album 1',
            albumCover: 'test-album-1/example_photo1.webp',
            isPrivate: false,
            isFeatured: true,
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
          logger().info(`Mock data inserted into ${albumTableName} table.`);
        }
      }
    });
    logger().info(`${albumTableName} table all set.`);
  } catch (error) {
    logger().error(`Error when checking ${albumTableName}: ${error}`);
  }
};

const initialiseAlbumTagsTable = async () => {
  try {
    await getTableStatus(albumTagsTableName);
  } catch (error) {
    logger().error(error);
    throw Error(
      `Table ${albumTagsTableName} does not exist. Please run 'bun run serverless:deploy' first.`,
    );
  }

  try {
    logger().info(`Checking ${albumTagsTableName} has data......`);
    await waitForTable(albumTagsTableName, async (value) => {
      if (value) {
        const items = await AlbumTagEntity.scan.go({ limit: 1, ignoreOwnership: true });
        if (items.data.length === 0) {
          logger().info(`Insert mock data into ${albumTagsTableName} table......`);
          await AlbumTagEntity.create({
            tag: 'test-tag-1',
          } as AlbumTag).go({ response: 'none' });
          logger().info(`Mock data inserted into ${albumTagsTableName} table.`);
        }
      }
    });
    logger().info(`${albumTagsTableName} table all set.`);
  } catch (error) {
    logger().error(`Error when checking ${albumTagsTableName}: ${error}`);
  }
};

export const initialiseDynamodbTables = async () => {
  logger().info('Verifying DynamoDB tables......');

  await Promise.all([initialiseAlbumTable(), initialiseAlbumTagsTable()]);
};
