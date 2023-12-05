import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import {
  CopyObjectCommand,
  CopyObjectCommandInput,
  DeleteObjectsCommand,
  DeleteObjectsCommandInput,
  ListObjectsV2Command,
  ListObjectsV2CommandInput,
  ListObjectsV2CommandOutput,
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';
import get from 'lodash/get';
import { BaseService, Photo } from '../models';
import { configuration } from './config';

export class S3Service implements BaseService<Photo> {
  public readonly s3Client = new S3Client(configuration);
  public readonly cdnURL = process.env.IMAGEKIT_CDN_URL;

  async findPhotosByAlbumId(params: ListObjectsV2CommandInput): Promise<Photo[]> {
    // Use unauthenticated identity
    const s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: fromCognitoIdentityPool({
        client: new CognitoIdentityClient({ region: process.env.AWS_REGION }),
        identityPoolId: process.env.AWS_IDENTITY_POOL_ID as string,
      }),
    });

    const response = await s3Client.send(new ListObjectsV2Command(params));
    const s3ObjectContents = get(response, 'Contents', []);

    // Compose photos array from s3ObjectContents
    const photos: Photo[] = s3ObjectContents.map((photo) => {
      let url = '';
      let key = '';
      if (photo && photo.Key) {
        url = this.cdnURL + encodeURI(photo.Key);
        key = photo.Key;
      }
      return { url, key };
    });

    return Promise.resolve(photos);
  }

  async create(params: PutObjectCommandInput): Promise<boolean> {
    const response = await this.s3Client.send(new PutObjectCommand(params));
    return response.$metadata.httpStatusCode === 200;
  }

  async delete(params: DeleteObjectsCommandInput): Promise<boolean> {
    const response = await this.s3Client.send(new DeleteObjectsCommand(params));
    if (response.$metadata.httpStatusCode === 200) {
      console.log('##### Delete objects:', response.Deleted?.map((deleted) => deleted.Key));
    }
    return response.$metadata.httpStatusCode === 200;
  }

  async copy(params: CopyObjectCommandInput): Promise<boolean> {
    const response = await this.s3Client.send(new CopyObjectCommand(params));
    return response.$metadata.httpStatusCode === 200;
  }

  async listObjects(params: ListObjectsV2CommandInput): Promise<ListObjectsV2CommandOutput> {
    return await this.s3Client.send(new ListObjectsV2Command(params));
  }
}
