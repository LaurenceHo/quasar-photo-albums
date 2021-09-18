import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';
import { Photo } from 'components/models';
import { Notify } from 'quasar';

export default class S3Service {
  async getPhotoObject(albumName: string, maxKeys: number) {
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
  }
}
