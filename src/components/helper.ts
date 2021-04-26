import AWS from 'aws-sdk';
import { Photo } from 'components/models';

export const getPhotos = (albumName: string, maxKeys: number, callback: any) => {
  const bucketName = process.env.AWS_S3_BUCKET_NAME as string;

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
      const bucketUrl = `http://${bucketName}/`;

      if (data && data.Contents) {
        photos = data.Contents.map((photo) => {
          let url = '';
          let key = '';
          if (photo && photo.Key) {
            url = bucketUrl + encodeURIComponent(photo.Key);
            key = photo.Key;
          }
          return { url, key };
        });
      }
      callback(photos);
    }
  );
};
