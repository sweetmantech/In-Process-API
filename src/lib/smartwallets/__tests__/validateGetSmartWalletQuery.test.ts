import { describe, it, expect } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import validateGetSmartWalletQuery from '@/lib/smartwallets/validateGetSmartWalletQuery';

const ARTIST_ID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

const makeRequest = (params: Record<string, string> = {}) => {
  const url = new URL('http://localhost/api/smartwallet');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url);
};

describe('validateGetSmartWalletQuery', () => {
  it('returns validated data when artistId is provided', () => {
    const result = validateGetSmartWalletQuery(
      makeRequest({ artistId: ARTIST_ID })
    );

    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as { artistId: string }).artistId).toBe(ARTIST_ID);
  });

  it('returns 400 when artistId is missing', () => {
    const result = validateGetSmartWalletQuery(makeRequest());

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });
});
