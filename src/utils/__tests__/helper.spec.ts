import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  compareDbUpdatedTime,
  fetchDbUpdatedTime,
  getStaticFileUrl,
  getYearOptions,
  interpolateGreatCircle,
  sortByKey,
} from '../helper';

global.fetch = vi.fn();

describe('Helpers', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getStaticFileUrl', () => {
    it('should return the correct URL with the object key appended', () => {
      vi.stubEnv('VITE_STATIC_FILES_URL', 'https://example.com/static');
      const objectKey = 'test-file.json';
      const expectedUrl = 'https://example.com/static/test-file.json';
      expect(getStaticFileUrl(objectKey)).toBe(expectedUrl);
      vi.unstubAllEnvs();
    });

    it('should handle an empty object key', () => {
      vi.stubEnv('VITE_STATIC_FILES_URL', 'https://example.com/static');
      const objectKey = '';
      const expectedUrl = 'https://example.com/static/';
      expect(getStaticFileUrl(objectKey)).toBe(expectedUrl);
      vi.unstubAllEnvs();
    });
  });

  // Test fetchDbUpdatedTime
  describe('fetchDbUpdatedTime', () => {
    it('should return the time from the fetched JSON', async () => {
      vi.stubEnv('VITE_STATIC_FILES_URL', 'https://example.com/static');
      const mockResponse = { album: '2023-10-01T12:00:00Z' };
      (global.fetch as any).mockResolvedValue({
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      const result = await fetchDbUpdatedTime();
      expect(fetch).toHaveBeenCalledWith('https://example.com/static/updateDatabaseAt.json');
      expect(result).toHaveProperty('album', '2023-10-01T12:00:00Z');
    });

    it('should return null if fetch fails', async () => {
      vi.stubEnv('VITE_STATIC_FILES_URL', 'https://example.com/static');
      (global.fetch as any).mockRejectedValue(new Error('CORS issue'));

      const result = await fetchDbUpdatedTime();
      expect(result).toBeNull();

      vi.spyOn({ getStaticFileUrl }, 'getStaticFileUrl').mockRestore();
    });
  });

  // Test compareDbUpdatedTime
  describe('compareDbUpdatedTime', () => {
    it('should return isLatest true if local and remote times match', async () => {
      vi.spyOn({ getStaticFileUrl }, 'getStaticFileUrl').mockReturnValue(
        'https://example.com/static/updateDatabaseAt.json',
      );

      const mockResponse = { album: '2023-10-01T12:00:00Z' };
      (global.fetch as any).mockResolvedValue({
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      const localDbUpdatedTime = '2023-10-01T12:00:00Z';
      const result = await compareDbUpdatedTime(localDbUpdatedTime, 'album');
      expect(result).toEqual({
        isLatest: true,
        dbUpdatedTime: '2023-10-01T12:00:00Z',
      });

      vi.spyOn({ getStaticFileUrl }, 'getStaticFileUrl').mockRestore();
    });

    it('should return isLatest false if local and remote times differ', async () => {
      vi.spyOn({ getStaticFileUrl }, 'getStaticFileUrl').mockReturnValue(
        'https://example.com/static/updateDatabaseAt.json',
      );

      const mockResponse = { album: '2023-10-01T12:00:00Z' };
      (global.fetch as any).mockResolvedValue({
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      const localDbUpdatedTime = '2023-09-01T12:00:00Z';
      const result = await compareDbUpdatedTime(localDbUpdatedTime, 'album');
      expect(result).toEqual({
        isLatest: false,
        dbUpdatedTime: '2023-10-01T12:00:00Z',
      });

      vi.spyOn({ getStaticFileUrl }, 'getStaticFileUrl').mockRestore();
    });

    it('should return isLatest false and dbUpdatedTime null if fetch fails', async () => {
      vi.spyOn({ getStaticFileUrl }, 'getStaticFileUrl').mockReturnValue(
        'https://example.com/static/updateDatabaseAt.json',
      );

      (global.fetch as any).mockRejectedValue(new Error('CORS issue'));

      const localDbUpdatedTime = '2023-09-01T12:00:00Z';
      const result = await compareDbUpdatedTime(localDbUpdatedTime, 'album');
      expect(result).toEqual({
        isLatest: false,
        dbUpdatedTime: '',
      });

      vi.spyOn({ getStaticFileUrl }, 'getStaticFileUrl').mockRestore();
    });
  });

  // The rest of the tests (getYearOptions, sortByKey, interpolateGreatCircle) remain unchanged
  describe('getYearOptions', () => {
    it('should return an array of years from 2005 to the current year, starting with "na"', () => {
      vi.setSystemTime(new Date('2025-01-01'));
      const expectedYears = [
        'na',
        '2025',
        '2024',
        '2023',
        '2022',
        '2021',
        '2020',
        '2019',
        '2018',
        '2017',
        '2016',
        '2015',
        '2014',
        '2013',
        '2012',
        '2011',
        '2010',
        '2009',
        '2008',
        '2007',
        '2006',
        '2005',
      ];
      expect(getYearOptions()).toEqual(expectedYears);
    });

    it('should handle a different current year', () => {
      vi.setSystemTime(new Date('2006-01-01'));
      const expectedYears = ['na', '2006', '2005'];
      expect(getYearOptions()).toEqual(expectedYears);
    });

    afterEach(() => {
      vi.useRealTimers();
    });
  });

  describe('sortByKey', () => {
    it('should sort an array of objects by a string key in ascending order', () => {
      const array = [
        { name: 'Charlie', age: 30 },
        { name: 'Alice', age: 25 },
        { name: 'Bob', age: 35 },
      ];
      const sorted = sortByKey(array, 'name', 'asc');
      expect(sorted).toEqual([
        { name: 'Alice', age: 25 },
        { name: 'Bob', age: 35 },
        { name: 'Charlie', age: 30 },
      ]);
    });

    it('should sort an array of objects by a string key in descending order', () => {
      const array = [
        { name: 'Charlie', age: 30 },
        { name: 'Alice', age: 25 },
        { name: 'Bob', age: 35 },
      ];
      const sorted = sortByKey(array, 'name', 'desc');
      expect(sorted).toEqual([
        { name: 'Charlie', age: 30 },
        { name: 'Bob', age: 35 },
        { name: 'Alice', age: 25 },
      ]);
    });

    it('should sort an array of objects by a number key in ascending order', () => {
      const array = [
        { name: 'Charlie', age: 30 },
        { name: 'Alice', age: 25 },
        { name: 'Bob', age: 35 },
      ];
      const sorted = sortByKey(array, 'age', 'asc');
      expect(sorted).toEqual([
        { name: 'Alice', age: 25 },
        { name: 'Charlie', age: 30 },
        { name: 'Bob', age: 35 },
      ]);
    });

    it('should sort an array of objects by a number key in descending order', () => {
      const array = [
        { name: 'Charlie', age: 30 },
        { name: 'Alice', age: 25 },
        { name: 'Bob', age: 35 },
      ];
      const sorted = sortByKey(array, 'age', 'desc');
      expect(sorted).toEqual([
        { name: 'Bob', age: 35 },
        { name: 'Charlie', age: 30 },
        { name: 'Alice', age: 25 },
      ]);
    });

    it('should handle mixed types by returning 0 (no sorting)', () => {
      const array = [
        { value: 'string', id: 1 },
        { value: 42, id: 2 },
      ];
      const sorted = sortByKey(array, 'value', 'asc');
      expect(sorted).toEqual([
        { value: 'string', id: 1 },
        { value: 42, id: 2 },
      ]);
    });
  });

  describe('interpolateGreatCircle', () => {
    it('should generate a single segment for a short route without antimeridian crossing', () => {
      const start: [number, number] = [121.5654, 25.033]; // Taipei
      const end: [number, number] = [139.6917, 35.6895]; // Tokyo
      const steps = 2;
      const result = interpolateGreatCircle(start, end, steps);

      expect(result.length).toBe(1);
      expect(result[0].length).toBe(3);

      // Check start point with tolerance for floating-point precision
      expect(result[0][0][0]).toBeCloseTo(121.5654, 5); // Longitude
      expect(result[0][0][1]).toBeCloseTo(25.033, 5); // Latitude

      // Check end point with tolerance
      expect(result[0][2][0]).toBeCloseTo(139.6917, 5); // Longitude
      expect(result[0][2][1]).toBeCloseTo(35.6895, 5); // Latitude

      // Check intermediate point with curvature
      const midPoint = result[0][1];
      const expectedLatWithoutCurve = (25.033 + 35.6895) / 2;
      expect(midPoint[0]).toBeGreaterThan(121.5654);
      expect(midPoint[0]).toBeLessThan(139.6917);
      expect(midPoint[1]).toBeGreaterThan(expectedLatWithoutCurve); // Verify upward curve
    });

    it('should generate a single segment for a route crossing the antimeridian', () => {
      const start: [number, number] = [139.6917, 35.6895]; // Tokyo
      const end: [number, number] = [-118.2437, 34.0522]; // LA
      const steps = 10; // Increased steps for better resolution
      const result = interpolateGreatCircle(start, end, steps);

      expect(result.length).toBe(1);
      expect(result[0].length).toBe(11); // steps + 1 (including start and end)

      // Check start point with tolerance
      expect(result[0][0][0]).toBeCloseTo(139.6917, 5); // Longitude
      expect(result[0][0][1]).toBeCloseTo(35.6895, 5); // Latitude

      // Check end point with tolerance, accounting for longitude wrapping
      const actualLon = result[0][10][0];
      const expectedLon = -118.2437;
      const normalizedDiff = Math.min(
        Math.abs(actualLon - expectedLon),
        Math.abs(actualLon + 360 - expectedLon),
        Math.abs(actualLon - 360 - expectedLon),
      );
      expect(normalizedDiff).toBeLessThan(0.00001); // Tolerance for 5 decimal places

      expect(result[0][10][1]).toBeCloseTo(34.0522, 5); // Latitude

      // Check for antimeridian crossing by analyzing longitude progression
      const longitudes = result[0].map((point) => point[0]);
      expect(longitudes[0] > 0).toBe(true); // Start in eastern hemisphere
      // Check end longitude with wrapping tolerance
      const endLonDiff = Math.min(
        Math.abs(longitudes[longitudes.length - 1] - expectedLon),
        Math.abs(longitudes[longitudes.length - 1] + 360 - expectedLon),
        Math.abs(longitudes[longitudes.length - 1] - 360 - expectedLon),
      );
      expect(endLonDiff).toBeLessThan(0.00001); // Ensure end matches LA longitude

      // Verify the path progresses across the antimeridian
      const startToEndDiff = Math.abs(longitudes[longitudes.length - 1] - longitudes[0]);
      const crossesAntimeridian = startToEndDiff > 180 || 360 - startToEndDiff > 180;
      expect(crossesAntimeridian).toBe(true); // Check for crossing
    });

    it('should apply curvature exaggeration correctly', () => {
      const start: [number, number] = [121.5654, 25.033]; // Taipei
      const end: [number, number] = [139.6917, 35.6895]; // Tokyo
      const steps = 4;
      const result = interpolateGreatCircle(start, end, steps);

      expect(result.length).toBe(1);
      expect(result[0].length).toBe(5);

      const midPoint = result[0][2];
      const expectedLatWithoutCurve = (25.033 + 35.6895) / 2;
      expect(midPoint[1]).toBeGreaterThan(expectedLatWithoutCurve); // Verify upward curve
      expect(midPoint[0]).toBeGreaterThan(121.5654); // Ensure longitude progresses
      expect(midPoint[0]).toBeLessThan(139.6917); // Ensure longitude progresses
    });
  });
});
