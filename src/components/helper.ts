import AWS from 'aws-sdk';
import { Album, Photo } from 'components/models';
import { firebase } from 'boot/firebase';

export const getAlbumList = async (startIndex?: number, endIndex?: number, filter?: string) => {
  // TODO: need to apply filter
  const albumList: Album[] = [];
  const db = firebase.firestore();
  const queryResult = await db.collection('s3-photo-albums').orderBy('albumName', 'desc').get();
  queryResult.forEach((doc) => {
    albumList.push(doc.data() as Album);
  });
  return albumList;
};

export const getPhotoObjectFromS3 = (albumName: string, maxKeys: number, callback: any) => {
  const bucketName = process.env.AWS_S3_BUCKET_NAME as string;
  const cdnURL = process.env.IMAGEKIT_CDN_URL as string;

  // Initialize the Amazon Cognito credentials provider
  AWS.config.region = process.env.AWS_REGION as string; // Region
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: process.env.AWS_IDENTITY_POOL_ID as string,
  });

  const s3 = new AWS.S3({
    apiVersion: '2006-03-01',
  });

  const albumPhotosKey = encodeURIComponent(albumName) + '/';
  let photos: Photo[] = [];
  s3.listObjectsV2(
    // Get first photo of album as album cover
    { Prefix: albumPhotosKey, Bucket: bucketName, MaxKeys: maxKeys, StartAfter: albumPhotosKey },
    (err, data) => {
      if (err) {
        return;
      }

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
      callback(photos);
    }
  );
};
