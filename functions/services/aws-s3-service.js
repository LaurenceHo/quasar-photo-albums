const { S3Client, ListObjectsV2Command, UploadPartCommand } = require('@aws-sdk/client-s3');
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

const uploadObject = async (idToken, filePath, file) => {
  console.log('##### file', file);
  const identityId = await _getIdFromCognito(idToken);
  const credentials = await _getCredentials(identityId, idToken);

  // FIXME
  const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials,
  });

  const command = new UploadPartCommand({
    Body: file,
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: filePath,
  });

  return s3Client.send(command);
};

exports.fetchObjectFromS3 = fetchObjectFromS3;
exports.uploadObject = uploadObject;
