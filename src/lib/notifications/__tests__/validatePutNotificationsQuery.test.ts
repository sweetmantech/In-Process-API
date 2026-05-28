import { describe, it, expect } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import validatePutNotificationsQuery from '@/lib/notifications/validatePutNotificationsQuery';

const ARTIST_ID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

const makeRequest = (params: Record<string, string> = {}) => {
  const url = new URL('http://localhost/api/notifications');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url);
};

describe('validatePutNotificationsQuery', () => {
  describe('defaults', () => {
    it('returns undefined artist_id when not provided', () => {
      const result = validatePutNotificationsQuery(makeRequest());
      expect((result as any).artist_id).toBeUndefined();
    });

    it('returns an object (not NextResponse) with no params', () => {
      const result = validatePutNotificationsQuery(makeRequest());
      expect(result).not.toBeInstanceOf(NextResponse);
    });
  });

  describe('artist_id param', () => {
    it('accepts a valid UUID', () => {
      const result = validatePutNotificationsQuery(
        makeRequest({ artist_id: ARTIST_ID })
      );
      expect((result as any).artist_id).toBe(ARTIST_ID);
    });

    it('returns 400 for an invalid UUID', () => {
      const result = validatePutNotificationsQuery(
        makeRequest({ artist_id: 'not-a-uuid' })
      );
      expect(result).toBeInstanceOf(NextResponse);
      expect((result as NextResponse).status).toBe(400);
    });

    it('returns 400 for a partial UUID', () => {
      const result = validatePutNotificationsQuery(
        makeRequest({ artist_id: '00000000' })
      );
      expect(result).toBeInstanceOf(NextResponse);
      expect((result as NextResponse).status).toBe(400);
    });

    it('ignores unknown params and succeeds', () => {
      const result = validatePutNotificationsQuery(
        makeRequest({ unknown: 'value' })
      );
      expect(result).not.toBeInstanceOf(NextResponse);
      expect((result as any).artist_id).toBeUndefined();
    });
  });
});
