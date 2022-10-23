const {
  S3Client,
  ListObjectsV2Command,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  PutObjectCommand,
} = require('@aws-sdk/client-s3');
const { fromCognitoIdentityPool } = require('@aws-sdk/credential-provider-cognito-identity');
const { CognitoIdentityClient } = require('@aws-sdk/client-cognito-identity');

const fetchObjectFromS3 = async (folderName, maxKeys) => {
  const folderNameKey = encodeURIComponent(folderName) + '/';
  // Use unauth identity
  const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: fromCognitoIdentityPool({
      client: new CognitoIdentityClient({ region: process.env.AWS_REGION }),
      identityPoolId: process.env.AWS_IDENTITY_POOL_ID,
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
const uploadObject = async (filePath, object) => {
  console.log('##### S3 FilePath:', filePath);

  const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  const command = new PutObjectCommand({
    Body: object,
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: filePath,
  });

  return s3Client.send(command);
};

const deleteObject = async (idToken, objectKey) => {
  const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: objectKey,
  });

  return s3Client.send(command);
};

const emptyS3Folder = async (folderName) => {
  const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  const listObjectsV2Command = new ListObjectsV2Command({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Prefix: folderName,
  });

  const listedObjects = await s3Client.send(listObjectsV2Command);

  if (listedObjects.Contents.length === 0) return;

  if (listedObjects.IsTruncated) {
    await emptyS3Folder(folderName);
  }

  const deleteParams = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Delete: { Objects: [] },
  };

  listedObjects.Contents.forEach(({ Key }) => {
    deleteParams.Delete.Objects.push({ Key });
  });

  const deleteObjectsCommand = new DeleteObjectsCommand(deleteParams);

  return s3Client.send(deleteObjectsCommand);
};

exports.fetchObjectFromS3 = fetchObjectFromS3;
exports.uploadObject = uploadObject;
exports.deleteObject = deleteObject;
exports.emptyS3Folder = emptyS3Folder;
