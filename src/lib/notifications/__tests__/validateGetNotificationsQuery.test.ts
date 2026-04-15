import { describe, it, expect } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import validateGetNotificationsQuery from '@/lib/notifications/validateGetNotificationsQuery';

const makeRequest = (params: Record<string, string> = {}) => {
  const url = new URL('http://localhost/api/notifications');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url);
};

describe('validateGetNotificationsQuery', () => {
  describe('defaults', () => {
    it('defaults limit to 20', () => {
      const result = validateGetNotificationsQuery(makeRequest());
      expect((result as any).limit).toBe(20);
    });

    it('defaults page to 1', () => {
      const result = validateGetNotificationsQuery(makeRequest());
      expect((result as any).page).toBe(1);
    });

    it('returns undefined for optional artist and viewed when not provided', () => {
      const result = validateGetNotificationsQuery(makeRequest());
      expect((result as any).artist).toBeUndefined();
      expect((result as any).viewed).toBeUndefined();
    });
  });

  describe('limit param', () => {
    it('parses numeric limit', () => {
      const result = validateGetNotificationsQuery(
        makeRequest({ limit: '50' })
      );
      expect((result as any).limit).toBe(50);
    });

    it('caps limit at 100', () => {
      const result = validateGetNotificationsQuery(
        makeRequest({ limit: '200' })
      );
      expect((result as any).limit).toBe(100);
    });

    it('returns 400 for non-numeric limit', () => {
      const result = validateGetNotificationsQuery(
        makeRequest({ limit: 'abc' })
      );
      expect(result).toBeInstanceOf(NextResponse);
      expect((result as NextResponse).status).toBe(400);
    });
  });

  describe('viewed param', () => {
    it('parses "true" as boolean true', () => {
      const result = validateGetNotificationsQuery(
        makeRequest({ viewed: 'true' })
      );
      expect((result as any).viewed).toBe(true);
    });

    it('parses "false" as boolean false', () => {
      const result = validateGetNotificationsQuery(
        makeRequest({ viewed: 'false' })
      );
      expect((result as any).viewed).toBe(false);
    });

    it('returns 400 for invalid viewed value', () => {
      const result = validateGetNotificationsQuery(
        makeRequest({ viewed: 'yes' })
      );
      expect(result).toBeInstanceOf(NextResponse);
      expect((result as NextResponse).status).toBe(400);
    });
  });

  describe('artist param', () => {
    it('accepts a valid address and normalizes to lowercase', () => {
      const result = validateGetNotificationsQuery(
        makeRequest({ artist: '0xAf1452D289E22fBD0DeA9d5097353C72a90Fac33' })
      );
      expect((result as any).artist).toBe(
        '0xaf1452d289e22fbd0dea9d5097353c72a90fac33'
      );
    });

    it('returns 400 for an invalid address', () => {
      const result = validateGetNotificationsQuery(
        makeRequest({ artist: 'not-an-address' })
      );
      expect(result).toBeInstanceOf(NextResponse);
      expect((result as NextResponse).status).toBe(400);
    });
  });
});
