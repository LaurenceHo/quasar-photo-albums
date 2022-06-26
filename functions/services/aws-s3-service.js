const { S3Client, ListObjectsV2Command, UploadPartCommand } = require('@aws-sdk/client-s3');
const { fromCognitoIdentityPool } = require('@aws-sdk/credential-provider-cognito-identity');
const { CognitoIdentityClient } = require('@aws-sdk/client-cognito-identity');

const fetchObjectFromS3 = async (folderName, maxKeys) => {
  const folderNameKey = encodeURIComponent(folderName) + '/';
  const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: fromCognitoIdentityPool({
      client: new CognitoIdentityClient({ region: process.env.AWS_REGION }),
      identityPoolId: process.env.AWS_PUBLIC_IDENTITY_POOL_ID,
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

const uploadObject = (idToken, filePath, object) => {
  // FIXME
  const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: fromCognitoIdentityPool({
      client: new CognitoIdentityClient({ region: process.env.AWS_REGION }),
      identityPoolId: process.env.AWS_AUTH_IDENTITY_POOL_ID,
      logins: {
        'accounts.google.com': idToken,
      },
    }),
  });

  const command = new UploadPartCommand({
    Body: object,
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: filePath,
  });

  return s3Client.send(command);
};

exports.fetchObjectFromS3 = fetchObjectFromS3;
exports.uploadObject = uploadObject;
