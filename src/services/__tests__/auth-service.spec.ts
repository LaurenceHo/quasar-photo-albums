import { ApiBaseUrl } from '@/services/api-base-url';
import { BaseApiRequestService } from '@/services/base-api-request-service';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../auth-service';

// Mock the BaseApiRequestService
vi.mock('@/services/base-api-request-service', () => ({
  BaseApiRequestService: {
    perform: vi.fn()
  }
}));

describe('AuthService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('login', () => {
    it('should call BaseApiRequestService.perform with correct parameters', async () => {
      const mockToken = 'mock-token';
      const mockResponse = { ok: true, json: vi.fn().mockResolvedValue({}) };
      (BaseApiRequestService.perform as any).mockResolvedValue(mockResponse);

      await AuthService.login(mockToken);

      expect(BaseApiRequestService.perform).toHaveBeenCalledWith('POST', `${ApiBaseUrl}/auth/verifyIdToken`, {
        token: mockToken
      });
    });

    it('should return the JSON response from the API', async () => {
      const mockUserPermission = { userId: '123', permissions: ['read', 'write'] };
      const mockResponse = { ok: true, json: vi.fn().mockResolvedValue(mockUserPermission) };
      (BaseApiRequestService.perform as any).mockResolvedValue(mockResponse);

      const result = await AuthService.login('mock-token');

      expect(result).toEqual(mockUserPermission);
    });

    it('should throw an error if the API request fails', async () => {
      const mockResponse = { ok: false, statusText: 'Unauthorized' };
      (BaseApiRequestService.perform as any).mockResolvedValue(mockResponse);

      await expect(AuthService.login('invalid-token')).rejects.toThrow('Unauthorized');
    });
  });

  describe('userInfo', () => {
    it('should call BaseApiRequestService.perform with correct parameters', async () => {
      const mockResponse = { ok: true, json: vi.fn().mockResolvedValue({}) };
      (BaseApiRequestService.perform as any).mockResolvedValue(mockResponse);

      await AuthService.userInfo();

      expect(BaseApiRequestService.perform).toHaveBeenCalledWith('GET', `${ApiBaseUrl}/auth/userInfo`);
    });

    it('should return the JSON response from the API', async () => {
      const mockUserInfo = { userId: '123', permissions: ['read', 'write'] };
      const mockResponse = { ok: true, json: vi.fn().mockResolvedValue(mockUserInfo) };
      (BaseApiRequestService.perform as any).mockResolvedValue(mockResponse);

      const result = await AuthService.userInfo();

      expect(result).toEqual(mockUserInfo);
    });

    it('should not throw an error if the API request fails', async () => {
      const mockResponse = { ok: false, json: vi.fn().mockResolvedValue({ error: 'Unauthorized' }) };
      (BaseApiRequestService.perform as any).mockResolvedValue(mockResponse);

      const result = await AuthService.userInfo();

      expect(result).toEqual({ error: 'Unauthorized' });
    });
  });

  describe('logout', () => {
    it('should call BaseApiRequestService.perform with correct parameters', async () => {
      const mockResponse = { ok: true };
      (BaseApiRequestService.perform as any).mockResolvedValue(mockResponse);

      await AuthService.logout();

      expect(BaseApiRequestService.perform).toHaveBeenCalledWith('POST', `${ApiBaseUrl}/auth/logout`);
    });

    it('should not return anything if logout is successful', async () => {
      const mockResponse = { ok: true };
      (BaseApiRequestService.perform as any).mockResolvedValue(mockResponse);

      const result = await AuthService.logout();

      expect(result).toBeUndefined();
    });

    it('should throw an error if the API request fails', async () => {
      const mockResponse = { ok: false, statusText: 'Internal Server Error' };
      (BaseApiRequestService.perform as any).mockResolvedValue(mockResponse);

      await expect(AuthService.logout()).rejects.toThrow('Internal Server Error');
    });
  });
});
