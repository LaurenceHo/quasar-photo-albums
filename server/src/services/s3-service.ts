import {
  _Object,
  CopyObjectCommand,
  CopyObjectCommandInput,
  DeleteObjectsCommand,
  DeleteObjectsCommandInput,
  HeadObjectCommand,
  HeadObjectCommandInput,
  ListObjectsV2Command,
  ListObjectsV2CommandInput,
  ListObjectsV2CommandOutput,
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3';
import { get } from 'radash';
import { BaseService, Photo } from '../models.js';
import { configuration } from './config.js';

export default class S3Service implements BaseService<Photo> {
  public readonly s3Client = new S3Client(configuration);
  public readonly cdnURL = process.env.IMAGEKIT_CDN_URL;

  async findAll(params: ListObjectsV2CommandInput): Promise<Photo[]> {
    const response = await this.s3Client.send(new ListObjectsV2Command(params));
    const s3ObjectContents: _Object[] = get(response, 'Contents', []);

    // Compose photos array from s3ObjectContents
    const photos: Photo[] = s3ObjectContents.map((photo) => {
      let url = '';
      let key = '';
      let size = 0;
      let lastModified = new Date();
      if (photo?.Key) {
        url = `${this.cdnURL}/${encodeURI(photo.Key)}`;
        key = photo.Key;
        size = photo.Size ?? 0;
        lastModified = photo.LastModified ?? new Date();
      }
      return { url, key, size, lastModified };
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
      console.log(
        '##### Delete objects:',
        response.Deleted?.map((deleted) => deleted.Key)
      );
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

  async checkObject(params: HeadObjectCommandInput): Promise<boolean> {
    try {
      const response = await this.s3Client.send(new HeadObjectCommand(params));
      return response.$metadata.httpStatusCode === 200;
    } catch (error) {
      return false;
    }
  }
}
