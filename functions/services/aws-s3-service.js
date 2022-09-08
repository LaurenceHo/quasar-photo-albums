const { S3Client, ListObjectsV2Command, DeleteObjectCommand, DeleteObjectsCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const { fromCognitoIdentityPool } = require('@aws-sdk/credential-provider-cognito-identity');
const {
  CognitoIdentityClient,
  GetIdCommand,
  GetCredentialsForIdentityCommand,
} = require('@aws-sdk/client-cognito-identity');

const cognitoIdentityClient = new CognitoIdentityClient({ region: process.env.AWS_REGION });

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
const uploadObject = async (idToken, filePath, object) => {
  console.log('##### S3 FilePath:', filePath);
  // Get credentials from Cognito: https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-identity.html
  const identityId = await _getIdFromCognito(idToken);
  const credentials = await _getCredentials(identityId, idToken);

  const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: credentials.AccessKeyId,
      secretAccessKey: credentials.SecretKey,
      sessionToken: credentials.SessionToken,
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
  const identityId = await _getIdFromCognito(idToken);
  const credentials = await _getCredentials(identityId, idToken);

  const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: credentials.AccessKeyId,
      secretAccessKey: credentials.SecretKey,
      sessionToken: credentials.SessionToken,
    },
  });

  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: objectKey,
  });

  return s3Client.send(command);
};

const deleteFolders = (idToken, folderName) => {
  return _emptyS3Folder(idToken, folderName);
};

const _getIdFromCognito = async (idToken) => {
  const command = new GetIdCommand({
    IdentityPoolId: process.env.AWS_IDENTITY_POOL_ID,
    Logins: {
      'accounts.google.com': idToken,
    },
  });
  const response = await cognitoIdentityClient.send(command);
  return response.IdentityId;
};

const _getCredentials = async (identityId, idToken) => {
  const command = new GetCredentialsForIdentityCommand({
    IdentityId: identityId,
    Logins: {
      'accounts.google.com': idToken,
    },
  });
  const response = await cognitoIdentityClient.send(command);
  return response.Credentials;
};

const _emptyS3Folder = async (idToken, folderName) => {
  const identityId = await _getIdFromCognito(idToken);
  const credentials = await _getCredentials(identityId, idToken);

  const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: credentials.AccessKeyId,
      secretAccessKey: credentials.SecretKey,
      sessionToken: credentials.SessionToken,
    },
  });

  const listObjectsV2Command = new ListObjectsV2Command({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Prefix: folderName,
  });

  const listedObjects = await s3Client.send(listObjectsV2Command);

  if (listedObjects.Contents.length === 0) return;

  if (listedObjects.IsTruncated) {
    await _emptyS3Folder(idToken, folderName)
  }

  const deleteParams = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Delete: { Objects: [] }
  };

  listedObjects.Contents.forEach(({ Key }) => {
    deleteParams.Delete.Objects.push({ Key });
  });

  const deleteObjectsCommand = new DeleteObjectsCommand(deleteParams);

  return s3Client.send(deleteObjectsCommand);
}

exports.fetchObjectFromS3 = fetchObjectFromS3;
exports.uploadObject = uploadObject;
exports.deleteObject = deleteObject;
exports.deleteFolders = deleteFolders;
