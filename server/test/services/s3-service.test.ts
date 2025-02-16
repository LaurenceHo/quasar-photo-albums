import { ListObjectsV2CommandOutput } from '@aws-sdk/client-s3';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import S3Service from '../../src/services/s3-service';

// Mock the AWS S3 client and its methods
vi.mock('@aws-sdk/client-s3', () => {
  return {
    S3Client: vi.fn(() => ({
      send: vi.fn()
    })),
    ListObjectsV2Command: vi.fn(),
    PutObjectCommand: vi.fn(),
    DeleteObjectsCommand: vi.fn(),
    CopyObjectCommand: vi.fn(),
    HeadObjectCommand: vi.fn(),
    HeadBucketCommand: vi.fn()
  };
});

describe('S3Service', () => {
  let s3Service: S3Service;
  let mockSend: any;

  beforeEach(() => {
    s3Service = new S3Service();
    mockSend = vi.mocked(s3Service.s3Client.send);
  });

  describe('findAll', () => {
    it('should return an array of photos', async () => {
      const mockResponse: ListObjectsV2CommandOutput = {
        Contents: [
          {
            Key: 'photo1.jpg',
            Size: 1024,
            LastModified: new Date()
          },
          {
            Key: 'photo2.jpg',
            Size: 2048,
            LastModified: new Date()
          }
        ],
        $metadata: { httpStatusCode: 200 }
      };

      mockSend.mockResolvedValue(mockResponse);

      const photos = await s3Service.findAll({ Bucket: 'test-bucket' });

      expect(photos).toHaveLength(2);
      expect(photos[0].url).toContain('photo1.jpg');
      expect(photos[1].url).toContain('photo2.jpg');
    });

    it('should return an empty array if no contents are found', async () => {
      const mockResponse: ListObjectsV2CommandOutput = {
        Contents: undefined,
        $metadata: { httpStatusCode: 200 }
      };

      mockSend.mockResolvedValue(mockResponse);

      const photos = await s3Service.findAll({ Bucket: 'test-bucket' });

      expect(photos).toHaveLength(0);
    });
  });

  describe('create', () => {
    it('should return true if the object is created successfully', async () => {
      mockSend.mockResolvedValue({ $metadata: { httpStatusCode: 200 } });

      const result = await s3Service.create({ Bucket: 'test-bucket', Key: 'photo1.jpg' });

      expect(result).toBe(true);
    });

    it('should return false if the object creation fails', async () => {
      mockSend.mockResolvedValue({ $metadata: { httpStatusCode: 500 } });

      const result = await s3Service.create({ Bucket: 'test-bucket', Key: 'photo1.jpg' });

      expect(result).toBe(false);
    });
  });

  describe('delete', () => {
    it('should return true if the objects are deleted successfully', async () => {
      // Mock the response from the S3 client
      mockSend.mockResolvedValue({
        $metadata: { httpStatusCode: 200 },
        Deleted: [{ Key: 'photo1.jpg' }, { Key: 'photo2.jpg' }]
      });

      // Call the delete method
      const result = await s3Service.delete({
        Bucket: 'test-bucket',
        Delete: { Objects: [{ Key: 'photo1.jpg' }, { Key: 'photo2.jpg' }] }
      });

      // Assert the result
      expect(result).toBe(true);
    });

    it('should return false if the objects deletion fails', async () => {
      mockSend.mockResolvedValue({ $metadata: { httpStatusCode: 500 } });

      const result = await s3Service.delete({
        Bucket: 'test-bucket',
        Delete: { Objects: [{ Key: 'photo1.jpg' }, { Key: 'photo2.jpg' }] }
      });

      expect(result).toBe(false);
    });
  });

  describe('copy', () => {
    it('should return true if the object is copied successfully', async () => {
      mockSend.mockResolvedValue({ $metadata: { httpStatusCode: 200 } });

      const result = await s3Service.copy({
        Bucket: 'test-bucket',
        CopySource: 'source-bucket/photo1.jpg',
        Key: 'photo1.jpg'
      });

      expect(result).toBe(true);
    });

    it('should return false if the object copy fails', async () => {
      mockSend.mockResolvedValue({ $metadata: { httpStatusCode: 500 } });

      const result = await s3Service.copy({
        Bucket: 'test-bucket',
        CopySource: 'source-bucket/photo1.jpg',
        Key: 'photo1.jpg'
      });

      expect(result).toBe(false);
    });
  });

  describe('checkIfFileExists', () => {
    it('should return true if the file exists', async () => {
      mockSend.mockResolvedValue({ $metadata: { httpStatusCode: 200 } });

      const result = await s3Service.checkIfFileExists({ Bucket: 'test-bucket', Key: 'photo1.jpg' });

      expect(result).toBe(true);
    });

    it('should return false if the file does not exist', async () => {
      mockSend.mockRejectedValue(new Error('File not found'));

      const result = await s3Service.checkIfFileExists({ Bucket: 'test-bucket', Key: 'photo1.jpg' });

      expect(result).toBe(false);
    });
  });

  describe('checkIfBucketExists', () => {
    it('should return true if the bucket exists', async () => {
      mockSend.mockResolvedValue({ $metadata: { httpStatusCode: 200 } });

      const result = await s3Service.checkIfBucketExists({ Bucket: 'test-bucket' });

      expect(result).toBe(true);
    });

    it('should return false if the bucket does not exist', async () => {
      mockSend.mockRejectedValue(new Error('Bucket not found'));

      const result = await s3Service.checkIfBucketExists({ Bucket: 'test-bucket' });

      expect(result).toBe(false);
    });
  });
});
