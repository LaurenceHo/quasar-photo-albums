import { beforeEach, describe, expect, it, vi } from 'vitest';
import AlbumController from '../../src/controllers/album-controller';
import * as helpers from '../../src/controllers/helpers';

// Mock D1Client
const { mockFind, mockGetById, mockCreate, mockUpdate, mockDelete } = vi.hoisted(() => {
  return {
    mockFind: vi.fn().mockResolvedValue([]),
    mockGetById: vi.fn(),
    mockCreate: vi.fn(),
    mockUpdate: vi.fn(),
    mockDelete: vi.fn(),
  };
});

vi.mock('../../src/d1/d1-client', () => {
  return {
    D1Client: class {
      find = mockFind;
      getById = mockGetById;
      create = mockCreate;
      update = mockUpdate;
      delete = mockDelete;
    },
  };
});

// Mock helpers
vi.mock('../../src/controllers/helpers', async () => {
  const actual = await vi.importActual('../../src/controllers/helpers');
  return {
    ...actual,
    verifyIfIsAdmin: vi.fn(),
  };
});

describe('AlbumController', () => {
  let controller: AlbumController;
  let mockRequest: any;
  let mockReply: any;
  let mockD1Client: any;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new AlbumController();
    // mockD1Client is not needed as we use exported mocks directly

    mockRequest = {
      params: {},
      query: {},
      log: {
        error: vi.fn(),
        info: vi.fn(),
      },
    };

    mockReply = {
      status: vi.fn().mockReturnThis(),
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };
  });

  describe('findAll', () => {
    it('should query with year and isPrivate=false for non-admin user', async () => {
      // Arrange
      mockRequest.params = { year: '2023' };
      (helpers.verifyIfIsAdmin as any).mockReturnValue(false);

      // Act
      // @ts-ignore
      await controller.findAll(mockRequest, mockReply);

      // Assert
      expect(mockFind).toHaveBeenCalledWith({
        year: '2023',
        isPrivate: 0,
      });
    });

    it('should query with only year for admin user', async () => {
      // Arrange
      mockRequest.params = { year: '2023' };
      (helpers.verifyIfIsAdmin as any).mockReturnValue(true);

      // Act
      // @ts-ignore
      await controller.findAll(mockRequest, mockReply);

      // Assert
      expect(mockFind).toHaveBeenCalledWith({
        year: '2023',
      });
    });
  });
});
