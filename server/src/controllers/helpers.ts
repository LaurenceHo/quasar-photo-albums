import { DeleteObjectsCommandInput, PutObjectCommandInput } from '@aws-sdk/client-s3';
import { isEmpty } from 'radash';
import { Album } from '../schemas/album.js';
import AlbumService from '../services/album-service.js';
import S3Service from '../services/s3-service.js';

const s3BucketName = process.env.AWS_S3_BUCKET_NAME;
const albumService = new AlbumService();
const s3Service = new S3Service();

export const updatePhotoAlbum = async (album: Album) => {
  try {
    const cloneAlbum: any = { ...album };
    delete cloneAlbum.id;
    delete cloneAlbum.createdAt;
    delete cloneAlbum.createdBy;

    const result = await albumService.update({ id: album.id }, cloneAlbum);

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

export const perform = async (method: 'GET' | 'POST', urlPath: string, requestJsonBody?: any, maskFields?: string) => {
  const headers = new Headers({ Accept: '*/*' });
  headers.append('X-Goog-Api-Key', process.env.GOOGLE_PLACES_API_KEY as string);
  if (!isEmpty(maskFields)) {
    headers.append('X-Goog-FieldMask', maskFields ?? '');
  }

  const requestOptions: any = {};

  if (!isEmpty(requestJsonBody)) {
    // JSON content
    headers.append('Content-Type', 'application/json');
    requestOptions.body = JSON.stringify(requestJsonBody);
  }
  requestOptions.method = method.toUpperCase();
  requestOptions.headers = headers;

  const response = await fetch(`https://places.googleapis.com/v1/places${urlPath}`, requestOptions);
  return await response.json();
};
