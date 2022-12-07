import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';

export const fetchObjectFromS3 = async (folderName: string, maxKeys: number) => {
  const folderNameKey = decodeURIComponent(folderName) + '/';
  // Use unauthenticated identity
  const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: fromCognitoIdentityPool({
      client: new CognitoIdentityClient({ region: process.env.AWS_REGION }),
      identityPoolId: process.env.AWS_IDENTITY_POOL_ID as string,
    }),
  });

  const command = new ListObjectsV2Command({
    Prefix: folderNameKey,
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    MaxKeys: maxKeys,
    StartAfter: folderNameKey,
  });

  const result = await s3Client.send(command);
  return result?.Contents;
};

//https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/s3-example-photo-album-full.html
export const uploadObject = async (filePath: string, object: any) => {
  console.log('##### S3 FilePath:', filePath);

  const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    },
  });

  const command = new PutObjectCommand({
    Body: object,
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: filePath,
  });

  return s3Client.send(command);
};

export const deleteObject = async (objectKey: string) => {
  const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    },
  });

  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: objectKey,
  });

  return s3Client.send(command);
};

export const emptyS3Folder = async (folderName: string) => {
  const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    },
  });

  const listObjectsV2Command = new ListObjectsV2Command({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Prefix: folderName,
  });

  const listedObjects = (await s3Client.send(listObjectsV2Command)) as any;

  if (listedObjects.Contents.length === 0) return;

  if (listedObjects.IsTruncated) {
    await emptyS3Folder(folderName);
  }

  const deleteParams = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Delete: { Objects: [] },
  };

  listedObjects.Contents.forEach(({ Key }: any) => {
    // @ts-ignore
    deleteParams.Delete.Objects.push({ Key });
  });

  const deleteObjectsCommand = new DeleteObjectsCommand(deleteParams);

  return s3Client.send(deleteObjectsCommand);
};
