import { beforeEach, describe, expect, it, vi } from 'vitest';
import AggregateService from '../../../src/services/aggregate-service';
import HttpRequestService from '../../../src/services/http-request-service';

const mockPerform = vi.spyOn(HttpRequestService.prototype, 'perform').mockImplementation(() => Promise.resolve());
const mockSetDisplayingParameters = vi
  .spyOn(HttpRequestService.prototype, 'setDisplayingParameters')
  .mockImplementation(() => vi.fn());

beforeEach(() => {
  mockSetDisplayingParameters.mockClear();
  mockPerform.mockClear();
});

describe('aggregate-service.ts', () => {
  it('Call getAggregateData API with correct parameters', () => {
    const aggregateService = new AggregateService();

    aggregateService.getAggregateData('albumsWithLocation');
    expect(mockSetDisplayingParameters).toHaveBeenCalledWith(
      true,
      undefined,
      true,
      'Ooops, something went wrong, please try again later'
    );
    expect(mockPerform).toHaveBeenCalledWith('GET', '/albumsWithLocation');
  });
});
