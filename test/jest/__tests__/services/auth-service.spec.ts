import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import AuthService from 'src/services/auth-service';
import HttpRequestService from 'src/services/http-request-service';

const mockPerform = jest.spyOn(HttpRequestService.prototype, 'perform').mockImplementation(() => Promise.resolve());
const mockSetDisplayingParameters = jest
  .spyOn(HttpRequestService.prototype, 'setDisplayingParameters')
  .mockImplementation(() => jest.fn());

beforeEach(() => {
  mockSetDisplayingParameters.mockClear();
  mockPerform.mockClear();
});

describe('auth-service.ts', () => {
  it('Call verifyIdToken API with correct parameters', () => {
    const authService = new AuthService();

    authService.verifyIdToken('testTokenXXX');
    expect(mockSetDisplayingParameters).toHaveBeenCalledWith(true);
    expect(mockPerform).toHaveBeenCalledWith('POST', '/verifyIdToken', {
      token: 'testTokenXXX',
    });
  });

  it('Call getUserInfo API with correct parameters', () => {
    const authService = new AuthService();

    authService.getUserInfo();
    expect(mockSetDisplayingParameters).toHaveBeenCalledWith(false);
    expect(mockPerform).toHaveBeenCalledWith('GET', '/userInfo');
  });

  it('Call logout API with correct parameters', () => {
    const authService = new AuthService();

    authService.logout();
    expect(mockSetDisplayingParameters).toHaveBeenCalledWith(true);
    expect(mockPerform).toHaveBeenCalledWith('POST', '/logout');
  });
});
