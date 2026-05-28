import { describe, it, expect } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import validateGetNotificationsQuery from '@/lib/notifications/validateGetNotificationsQuery';

const ARTIST_ID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

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

    it('returns undefined for optional artist_id and viewed when not provided', () => {
      const result = validateGetNotificationsQuery(makeRequest());
      expect((result as any).artist_id).toBeUndefined();
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

  describe('artist_id param', () => {
    it('accepts a valid UUID', () => {
      const result = validateGetNotificationsQuery(
        makeRequest({ artist_id: ARTIST_ID })
      );
      expect((result as any).artist_id).toBe(ARTIST_ID);
    });

    it('returns 400 for an invalid UUID', () => {
      const result = validateGetNotificationsQuery(
        makeRequest({ artist_id: 'not-a-uuid' })
      );
      expect(result).toBeInstanceOf(NextResponse);
      expect((result as NextResponse).status).toBe(400);
    });
  });
});
