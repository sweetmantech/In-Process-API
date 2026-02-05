import { describe, it, expect } from 'vitest';
import parseRangeHeader from '@/lib/media/parseRangeHeader';

describe('parseRangeHeader', () => {
  const totalSize = 1000;

  describe('valid range headers', () => {
    it('should parse bytes=0-499', () => {
      const result = parseRangeHeader('bytes=0-499', totalSize);
      expect(result).toEqual({ start: 0, end: 499 });
    });

    it('should parse bytes=500-999', () => {
      const result = parseRangeHeader('bytes=500-999', totalSize);
      expect(result).toEqual({ start: 500, end: 999 });
    });

    it('should parse open-ended range bytes=500-', () => {
      const result = parseRangeHeader('bytes=500-', totalSize);
      expect(result).toEqual({ start: 500, end: undefined });
    });

    it('should parse bytes=0-0 (first byte only)', () => {
      const result = parseRangeHeader('bytes=0-0', totalSize);
      expect(result).toEqual({ start: 0, end: 0 });
    });
  });

  describe('invalid range headers', () => {
    it('should return null for null header', () => {
      const result = parseRangeHeader(null, totalSize);
      expect(result).toBeNull();
    });

    it('should return null for empty string', () => {
      const result = parseRangeHeader('', totalSize);
      expect(result).toBeNull();
    });

    it('should reject multi-range headers with commas', () => {
      const result = parseRangeHeader('bytes=0-100,200-300', totalSize);
      expect(result).toBeNull();
    });

    it('should reject unanchored prefix', () => {
      const result = parseRangeHeader('prefix bytes=0-100', totalSize);
      expect(result).toBeNull();
    });

    it('should reject unanchored suffix', () => {
      const result = parseRangeHeader('bytes=0-100 suffix', totalSize);
      expect(result).toBeNull();
    });

    it('should reject invalid format', () => {
      const result = parseRangeHeader('invalid', totalSize);
      expect(result).toBeNull();
    });

    it('should reject start >= totalSize', () => {
      const result = parseRangeHeader('bytes=1000-', totalSize);
      expect(result).toBeNull();
    });

    it('should reject negative start', () => {
      const result = parseRangeHeader('bytes=-100-200', totalSize);
      expect(result).toBeNull();
    });

    it('should reject end < start', () => {
      const result = parseRangeHeader('bytes=500-100', totalSize);
      expect(result).toBeNull();
    });

    it('should reject end >= totalSize', () => {
      const result = parseRangeHeader('bytes=0-1000', totalSize);
      expect(result).toBeNull();
    });
  });
});
