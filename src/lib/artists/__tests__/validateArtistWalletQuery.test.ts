import { describe, it, expect } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import validateArtistWalletQuery from '@/lib/artists/validateArtistWalletQuery';

const makeRequest = (params: Record<string, string> = {}) => {
  const url = new URL('http://localhost/api/artists/wallets');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url);
};

describe('validateArtistWalletQuery', () => {
  it('returns validated data when social_wallet is provided', () => {
    const result = validateArtistWalletQuery(
      makeRequest({ social_wallet: '0xabc' })
    );

    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as any).social_wallet).toBe('0xabc');
  });

  it('returns 400 when social_wallet is missing', () => {
    const result = validateArtistWalletQuery(makeRequest());

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when social_wallet is empty string', () => {
    const result = validateArtistWalletQuery(
      makeRequest({ social_wallet: '' })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });
});
