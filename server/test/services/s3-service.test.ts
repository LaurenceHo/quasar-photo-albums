import {
  CopyObjectCommand,
  DeleteObjectsCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';
import { beforeEach, describe, expect, it } from 'vitest';
import S3Service from '../../src/services/s3-service';

const s3Mock = mockClient(S3Client);

describe('S3Service', () => {
  let s3Service: S3Service;

  beforeEach(() => {
    s3Mock.reset();
    s3Service = new S3Service();
  });

  describe('findAll', () => {
    it('should return array of photos from S3 objects', async () => {
      const mockResponse = {
        Contents: [
          {
            Key: 'test-photo.jpg',
            Size: 1024,
            LastModified: new Date('2025-01-01'),
          },
        ],
      };

      s3Mock.on(ListObjectsV2Command).resolves(mockResponse);

      const result = await s3Service.findAll({ Bucket: 'test-bucket' });

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        key: 'test-photo.jpg',
        size: 1024,
        lastModified: new Date('2025-01-01'),
        url: `${s3Service.cdnURL}/test-photo.jpg`,
      });
    });

    it('should handle empty response', async () => {
      s3Mock.on(ListObjectsV2Command).resolves({});

      const result = await s3Service.findAll({ Bucket: 'test-bucket' });

      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('should return true when file is uploaded successfully', async () => {
      s3Mock.on(PutObjectCommand).resolves({
        $metadata: { httpStatusCode: 200 },
      });

      const result = await s3Service.create({
        Bucket: 'test-bucket',
        Key: 'test-photo.jpg',
        Body: 'test-content',
      });

      expect(result).toBe(true);
    });

    it('should return false when upload fails', async () => {
      s3Mock.on(PutObjectCommand).resolves({
        $metadata: { httpStatusCode: 500 },
      });

      const result = await s3Service.create({
        Bucket: 'test-bucket',
        Key: 'test-photo.jpg',
        Body: 'test-content',
      });

      expect(result).toBe(false);
    });
  });

  describe('delete', () => {
    it('should return true when objects are deleted successfully', async () => {
      s3Mock.on(DeleteObjectsCommand).resolves({
        $metadata: { httpStatusCode: 200 },
        Deleted: [{ Key: 'test-photo.jpg' }],
      });

      const result = await s3Service.delete({
        Bucket: 'test-bucket',
        Delete: { Objects: [{ Key: 'test-photo.jpg' }] },
      });

      expect(result).toBe(true);
    });

    it('should return false when deletion fails', async () => {
      s3Mock.on(DeleteObjectsCommand).resolves({
        $metadata: { httpStatusCode: 500 },
      });

      const result = await s3Service.delete({
        Bucket: 'test-bucket',
        Delete: { Objects: [{ Key: 'test-photo.jpg' }] },
      });

      expect(result).toBe(false);
    });
  });

  describe('copy', () => {
    it('should return true when object is copied successfully', async () => {
      s3Mock.on(CopyObjectCommand).resolves({
        $metadata: { httpStatusCode: 200 },
      });

      const result = await s3Service.copy({
        Bucket: 'test-bucket',
        CopySource: 'source-bucket/test-photo.jpg',
        Key: 'test-photo-copy.jpg',
      });

      expect(result).toBe(true);
    });

    it('should return false when copy fails', async () => {
      s3Mock.on(CopyObjectCommand).resolves({
        $metadata: { httpStatusCode: 500 },
      });

      const result = await s3Service.copy({
        Bucket: 'test-bucket',
        CopySource: 'source-bucket/test-photo.jpg',
        Key: 'test-photo-copy.jpg',
      });

      expect(result).toBe(false);
    });
  });

  describe('checkIfFileExists', () => {
    it('should return true when file exists', async () => {
      s3Mock.on(HeadObjectCommand).resolves({
        $metadata: { httpStatusCode: 200 },
      });

      const result = await s3Service.checkIfFileExists({
        Bucket: 'test-bucket',
        Key: 'test-photo.jpg',
      });

      expect(result).toBe(true);
    });

    it('should return false when file does not exist', async () => {
      s3Mock.on(HeadObjectCommand).rejects(new Error('Not Found'));

      const result = await s3Service.checkIfFileExists({
        Bucket: 'test-bucket',
        Key: 'test-photo.jpg',
      });

      expect(result).toBe(false);
    });
  });

  describe('checkIfBucketExists', () => {
    it('should return true when bucket exists', async () => {
      s3Mock.on(HeadBucketCommand).resolves({
        $metadata: { httpStatusCode: 200 },
      });

      const result = await s3Service.checkIfBucketExists({
        Bucket: 'test-bucket',
      });

      expect(result).toBe(true);
    });

    it('should return false when bucket does not exist', async () => {
      s3Mock.on(HeadBucketCommand).rejects(new Error('Not Found'));

      const result = await s3Service.checkIfBucketExists({
        Bucket: 'test-bucket',
      });

      expect(result).toBe(false);
    });
  });

  describe('listObjects', () => {
    it('should return ListObjectsV2CommandOutput when successful', async () => {
      const mockResponse = {
        Contents: [
          {
            Key: 'test-photo.jpg',
            Size: 1024,
            LastModified: new Date('2025-01-01'),
          },
        ],
      };

      s3Mock.on(ListObjectsV2Command).resolves(mockResponse);

      const result = await s3Service.listObjects({
        Bucket: 'test-bucket',
      });

      expect(result).toEqual(mockResponse);
    });
  });
});
