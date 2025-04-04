import { DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import logger from 'pino';
import { AlbumTag, AlbumTagEntity, albumTagsTableName } from '../schemas/album-tag.js';
import { Album, AlbumEntity, albumTableName } from '../schemas/album.js';
import {
  TravelRecord,
  TravelRecordEntity,
  travelRecordTableName,
} from '../schemas/travel-record.js';
import { UserPermission, UserPermissionEntity, userTableName } from '../schemas/user-permission.js';
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

const initialiseUserTable = async () => {
  try {
    await getTableStatus(userTableName);
  } catch (error) {
    logger().error(error);
    throw Error(`Table ${userTableName} does not exist. Please run 'bun run cdk:deploy' first.`);
  }

  try {
    logger().info(`Checking ${userTableName} has data......`);
    await waitForTable(userTableName, async (value) => {
      if (value) {
        const items = await UserPermissionEntity.scan.go({ limit: 1, ignoreOwnership: true });
        if (items.data.length === 0) {
          logger().info(`Insert mock data into ${userTableName} table......`);
          await UserPermissionEntity.create({
            uid: 'test-uid-1',
            email: 'test@example.com',
            displayName: 'Test User',
            role: 'admin',
          } as UserPermission).go({ response: 'none' });
          logger().info(`Mock data inserted into ${userTableName} table.`);
        }
      }
    });
    logger().info(`${userTableName} table all set.`);
  } catch (error) {
    logger().error(`Error when checking ${userTableName}: ${error}`);
  }
};

const initialiseTravelRecordTable = async () => {
  try {
    await getTableStatus(travelRecordTableName);
  } catch (error) {
    logger().error(error);
    throw Error(
      `Table ${travelRecordTableName} does not exist. Please run 'bun run cdk:deploy' first.`,
    );
  }

  try {
    logger().info(`Checking ${travelRecordTableName} has data......`);
    await waitForTable(travelRecordTableName, async (value) => {
      if (value) {
        const items = await TravelRecordEntity.scan.go({ limit: 1, ignoreOwnership: true });
        if (items.data.length === 0) {
          logger().info(`Insert mock data into ${travelRecordTableName} table......`);
          await TravelRecordEntity.create({
            id: 'Tokyo#LA',
            travelDate: new Date().toISOString(),
            departure: {
              displayName: 'Tokyo',
              formattedAddress: 'Tokyo, Japan',
              location: {
                latitude: 35.6895,
                longitude: 139.6917,
              },
            } as any,
            destination: {
              displayName: 'LA',
              formattedAddress: 'LA, USA',
              location: {
                latitude: 34.0522,
                longitude: -118.2437,
              },
            } as any,
            createdBy: 'System',
            updatedBy: 'System',
          } as TravelRecord).go({ response: 'none' });

          await TravelRecordEntity.create({
            id: 'LA#Atlanta',
            travelDate: new Date().toISOString(),
            departure: {
              displayName: 'LA',
              formattedAddress: 'LA, USA',
              location: {
                latitude: 34.0522,
                longitude: -118.2437,
              },
            } as any,
            destination: {
              formattedAddress: 'Atlanta, USA',
              displayName: 'Atlanta',
              location: {
                latitude: 33.749,
                longitude: -84.388,
              },
            } as any,
            createdBy: 'System',
            updatedBy: 'System',
          } as TravelRecord).go({ response: 'none' });
          logger().info(`Mock data inserted into ${travelRecordTableName} table.`);
        }
      }
    });
    logger().info(`${travelRecordTableName} table all set.`);
  } catch (error) {
    logger().error(`Error when checking ${travelRecordTableName}: ${error}`);
  }
};

export const initialiseDynamodbTables = async () => {
  logger().info('Verifying DynamoDB tables......');

  await Promise.all([
    initialiseAlbumTable(),
    initialiseAlbumTagsTable(),
    initialiseUserTable(),
    initialiseTravelRecordTable(),
  ]);
};
