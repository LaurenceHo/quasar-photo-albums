import { ReturnValue } from '@aws-sdk/client-dynamodb';
import { DeleteObjectsCommandInput, PutObjectCommandInput } from '@aws-sdk/client-s3';
import { Album } from '../models';
import AlbumService from '../services/album-service';
import { S3Service } from '../services/s3-service';

const s3BucketName = process.env.AWS_S3_BUCKET_NAME;
const albumService = new AlbumService();
const s3Service = new S3Service();

export const updatePhotoAlbum = async (album: Album) => {
  const params = {
    TableName: albumService.tableName,
    Key: {
      id: album.id,
    },
    UpdateExpression:
      'SET albumName = :albumName, ' +
      'albumCover = :albumCover, ' +
      'description = :description, ' +
      'tags = :tags, ' +
      'isPrivate = :isPrivate, ' +
      'place = :place, ' +
      'updatedAt = :updatedAt, ' +
      'updatedBy = :updatedBy',
    ExpressionAttributeValues: {
      ':albumName': album.albumName,
      ':albumCover': album.albumCover,
      ':description': album.description,
      ':tags': album.tags,
      ':isPrivate': album.isPrivate,
      ':place': album.place ?? null,
      ':updatedAt': album.updatedAt,
      ':updatedBy': album.updatedBy,
    },
    ReturnValues: ReturnValue.ALL_NEW,
  };

  try {
    const result = await albumService.update(params);

    if (result) {
      console.log('##### Album updated:', album.id);
      await uploadObject('updateDatabaseAt.json', JSON.stringify({ time: new Date().toISOString() }));
    }
    return result;
  } catch (err) {
    console.error(`Failed to update photo album: ${err}`);
    throw Error('Error when updating photo album');
  }
};

//https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/s3-example-photo-album-full.html
export const uploadObject = async (filePath: string, object: any) => {
  console.log('##### S3 destination file path:', filePath);

  try {
    const putObject: PutObjectCommandInput = {
      Body: object,
      Bucket: s3BucketName,
      Key: filePath,
    };

    if (filePath === 'updateDatabaseAt.json') {
      putObject.CacheControl = 'no-cache';
    }

    return await s3Service.create(putObject);
  } catch (err) {
    console.error(`Failed to upload photo: ${err}`);
    throw Error('Error when uploading photo');
  }
};

export const deleteObjects = async (objectKeys: string[]) => {
  const deleteParams: DeleteObjectsCommandInput = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Delete: { Objects: [] },
  };

  objectKeys.forEach((objectKeys) => deleteParams.Delete?.Objects?.push({ Key: objectKeys }));

  try {
    return await s3Service.delete(deleteParams);
  } catch (err) {
    console.error(`Failed to delete photos: ${err}`);
    throw Error('Error when deleting photos');
  }
};

export const emptyS3Folder = async (folderName: string) => {
  const listedObjects = await s3Service.listObjects({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Prefix: folderName,
  });

  if (!listedObjects.Contents || listedObjects.Contents?.length === 0) return true;

  if (listedObjects.IsTruncated) {
    await emptyS3Folder(folderName);
  }

  const listedObjectArray = listedObjects.Contents.map(({ Key }: any) => Key);

  try {
    return await deleteObjects(listedObjectArray);
  } catch (err) {
    console.error(`Failed to empty S3 folder: ${err}`);
    throw Error('Error when emptying S3 folder');
  }
};
