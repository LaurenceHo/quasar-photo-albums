const { getFirestore } = require('firebase-admin/firestore');
const admin = require('firebase-admin');
const _ = require('lodash');
const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const { fromCognitoIdentityPool } = require('@aws-sdk/credential-provider-cognito-identity');
const { CognitoIdentityClient } = require('@aws-sdk/client-cognito-identity');

const queryUserPermission = async (uid) => {
  const usersRef = getFirestore().collection('user-permission');
  const queryResult = await usersRef.where('uid', '==', uid).limit(1).get();
  let userPermission = null;
  queryResult.forEach((doc) => {
    userPermission = doc.data();
  });

  return userPermission;
};

const verifyJwtClaim = async (req, res, next) => {
  const _cleanToken = (message) => {
    res.clearCookie('session');
    return res.status(401).send({
      status: 'Unauthorized',
      message,
    });
  };

  if (req.cookies && req.cookies['__session']) {
    const sessionCookie = req.cookies['__session'];

    try {
      const decodedClaims = await admin.auth().verifySessionCookie(sessionCookie, true);
      if (decodedClaims.exp <= Date.now() / 1000) {
        _cleanToken('Session expired. Please login again.');
      }

      req['user'] = await queryUserPermission(decodedClaims.uid);
      next();
    } catch (error) {
      _cleanToken('Authentication failed. Please login.');
    }
  } else {
    _cleanToken('Authentication failed. Please login.');
  }
};

const verifyUserPermission = async (req, res, next) => {
  if (req.user.role === 'admin') {
    next();
  } else {
    res.status(403).send({ status: 'Unauthorized', message: 'Unauthorized action' });
  }
};

const isAdmin = async (sessionCookie) => {
  let decodedClaims = '';
  let userPermission = null;
  if (sessionCookie) {
    decodedClaims = await admin.auth().verifySessionCookie(sessionCookie, true);
    userPermission = await queryUserPermission(decodedClaims.uid);
  }
  return _.get(userPermission, 'role') === 'admin';
};

const fetchObjectFromS3 = async (albumName, maxKeys) => {
  const albumPhotosKey = encodeURIComponent(albumName) + '/';
  const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: fromCognitoIdentityPool({
      client: new CognitoIdentityClient({ region: process.env.AWS_REGION }),
      identityPoolId: process.env.AWS_IDENTITY_POOL_ID,
    }),
  });

  const command = new ListObjectsV2Command({
    Prefix: albumPhotosKey,
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    MaxKeys: maxKeys,
    StartAfter: albumPhotosKey,
  });

  try {
    const result = await s3Client.send(command);
    return result?.Contents;
  } catch (err) {
    console.log('Error', err);
  }
};

const setupDefaultAlbumCover = async (albumList) => {
  for (const album of albumList) {
    if (!album.albumCover) {
      const s3ObjectContents = await fetchObjectFromS3(album.id, 1);
      if (s3ObjectContents) {
        console.log('Photo key:', s3ObjectContents[0].Key);

        const albumRef = getFirestore().collection('s3-photo-albums').doc(album.id);
        albumRef.update({ ...album, albumCover: s3ObjectContents[0].Key }).then((res) => {
          console.log(`Document updated at ${res.writeTime}`);
        });
      }
    }
  }
};
exports.queryUserPermission = queryUserPermission;
exports.verifyJwtClaim = verifyJwtClaim;
exports.verifyUserPermission = verifyUserPermission;
exports.isAdmin = isAdmin;
exports.setupDefaultAlbumCover = setupDefaultAlbumCover;
exports.fetchObjectFromS3 = fetchObjectFromS3;
