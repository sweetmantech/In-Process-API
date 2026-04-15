import { describe, it, expect } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import validatePutNotificationsQuery from '@/lib/notifications/validatePutNotificationsQuery';

const makeRequest = (params: Record<string, string> = {}) => {
  const url = new URL('http://localhost/api/notifications');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url);
};

describe('validatePutNotificationsQuery', () => {
  describe('defaults', () => {
    it('returns undefined artist when not provided', () => {
      const result = validatePutNotificationsQuery(makeRequest());
      expect((result as any).artist).toBeUndefined();
    });

    it('returns an object (not NextResponse) with no params', () => {
      const result = validatePutNotificationsQuery(makeRequest());
      expect(result).not.toBeInstanceOf(NextResponse);
    });
  });

  describe('artist param', () => {
    it('accepts a valid address and normalizes to lowercase', () => {
      const result = validatePutNotificationsQuery(
        makeRequest({ artist: '0xAf1452D289E22fBD0DeA9d5097353C72a90Fac33' })
      );
      expect((result as any).artist).toBe(
        '0xaf1452d289e22fbd0dea9d5097353c72a90fac33'
      );
    });

    it('returns 400 for an invalid address', () => {
      const result = validatePutNotificationsQuery(
        makeRequest({ artist: 'not-an-address' })
      );
      expect(result).toBeInstanceOf(NextResponse);
      expect((result as NextResponse).status).toBe(400);
    });

    it('returns 400 for a partial address', () => {
      const result = validatePutNotificationsQuery(
        makeRequest({ artist: '0x1234' })
      );
      expect(result).toBeInstanceOf(NextResponse);
      expect((result as NextResponse).status).toBe(400);
    });

    it('ignores unknown params and succeeds', () => {
      const result = validatePutNotificationsQuery(
        makeRequest({ unknown: 'value' })
      );
      expect(result).not.toBeInstanceOf(NextResponse);
      expect((result as any).artist).toBeUndefined();
    });
  });
});
