import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';
import { firebaseApp } from 'boot/firebase';
import { Album, Photo } from 'components/models';
import { collection, doc, getDoc, getDocs, getFirestore, orderBy, query, setDoc, where } from 'firebase/firestore';
import { Notify } from 'quasar';

export const getAlbumList = async (startIndex?: number, endIndex?: number, filter?: string) => {
  // TODO: May need to apply filter in the feature. It only runs filter in the memory atm.
  const albumList: Album[] = [];
  const db = getFirestore(firebaseApp);
  const q = query(collection(db, 's3-photo-albums'), where('private', '==', false), orderBy('albumName', 'desc'));
  const queryResult = await getDocs(q).catch((error) => {
    throw error;
  });
  queryResult.forEach((doc) => {
    albumList.push(doc.data() as Album);
  });
  return albumList;
};

export const getAlbumTags = async () => {
  const db = getFirestore(firebaseApp);
  const docRef = doc(db, 'album-tags', 'album-tags');
  return await getDoc(docRef)
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
  const db = getFirestore(firebaseApp);

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
      for (const album of allAlbumList) {
        await setDoc(doc(db, 's3-photo-albums', album.albumName), {
          albumName: album.albumName,
          desc: '',
          tags: [],
          private: false,
        }).catch((error) => {
          throw error;
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
};
