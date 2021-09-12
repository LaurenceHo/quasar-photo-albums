import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';
import { firebase } from 'boot/firebase';
import { Album, Photo } from 'components/models';
import { Notify } from 'quasar';

export const getAlbumList = async (startIndex?: number, endIndex?: number, filter?: string) => {
  // TODO: need to apply filter
  const albumList: Album[] = [];
  const db = firebase.firestore();
  const queryResult = await db
    .collection('s3-photo-albums')
    .where('private', '==', false)
    .orderBy('albumName', 'desc')
    .get()
    .catch((error) => {
      throw error;
    });
  queryResult.forEach((doc) => {
    albumList.push(doc.data() as Album);
  });
  return albumList;
};

export const getAlbumTags = async () => {
  const db = firebase.firestore();
  return await db
    .collection('album-tags')
    .doc('album-tags')
    .get()
    .then((doc) => doc.data() as { tags: string[] })
    .catch((error) => {
      throw error;
    });
};

export const getPhotoObjectFromS3 = async (albumName: string, maxKeys: number) => {
  const bucketName = process.env.AWS_S3_BUCKET_NAME as string;
  const cdnURL = process.env.IMAGEKIT_CDN_URL as string;

  // Initialize the Amazon Cognito credentials provider
  const s3client = new S3Client({
    region: process.env.AWS_REGION as string,
    credentials: fromCognitoIdentityPool({
      client: new CognitoIdentityClient({ region: process.env.AWS_REGION as string }),
      identityPoolId: process.env.AWS_IDENTITY_POOL_ID as string,
    }),
  });

  const albumPhotosKey = encodeURIComponent(albumName) + '/';
  let photos: Photo[] = [];

  const command = new ListObjectsV2Command({
    Prefix: albumPhotosKey,
    Bucket: bucketName,
    MaxKeys: maxKeys,
    StartAfter: albumPhotosKey,
  });
  try {
    const data = await s3client.send(command);
    if (data && data.Contents) {
      photos = data.Contents.map((photo) => {
        let url = '';
        let key = '';
        if (photo && photo.Key) {
          url = cdnURL + encodeURI(photo.Key);
          key = photo.Key;
        }
        return { url, key };
      });
    }
  } catch (error) {
    console.log(error);
    Notify.create({
      color: 'red-4',
      textColor: 'white',
      icon: 'mdi-alert-circle-outline',
      message: error.toString(),
    });
  }
  return photos;
};

export const insertDataToFirestore = async () => {
  const db = firebase.firestore();

  const bucketName = process.env.AWS_S3_BUCKET_NAME as string;

  const s3client = new S3Client({
    region: process.env.AWS_REGION as string,
    credentials: fromCognitoIdentityPool({
      client: new CognitoIdentityClient({ region: process.env.AWS_REGION as string }),
      identityPoolId: process.env.AWS_IDENTITY_POOL_ID as string,
    }),
  });

  const command = new ListObjectsV2Command({ Delimiter: '/', Bucket: bucketName });
  try {
    const data = await s3client.send(command);
    if (data && data.CommonPrefixes) {
      const allAlbumList = data.CommonPrefixes.map((commonPrefix) => {
        const prefix = commonPrefix.Prefix;
        let albumName = '';
        if (prefix) {
          albumName = decodeURIComponent(prefix.replace('/', ''));
        }
        return { albumName };
      });

      // Insert data to Google Firebase
      allAlbumList.forEach((album: { albumName: string }) => {
        db.collection('s3-photo-albums').doc(album.albumName).set({
          albumName: album.albumName,
          desc: '',
          tags: [],
          private: false,
        });
      });
    }
  } catch (error) {
    console.log(error);
  }
};
