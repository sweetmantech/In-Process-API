import { describe, it, expect } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import validateGetSmartWalletQuery from '@/lib/smartwallets/validateGetSmartWalletQuery';

const VALID_WALLET = '0x1234567890123456789012345678901234567890';

const makeRequest = (params: Record<string, string> = {}) => {
  const url = new URL('http://localhost/api/smartwallet');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url);
};

describe('validateGetSmartWalletQuery', () => {
  it('returns validated data when artist_wallet is a valid address', () => {
    const result = validateGetSmartWalletQuery(
      makeRequest({ artist_wallet: VALID_WALLET })
    );

    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as { artist_wallet: string }).artist_wallet).toBe(
      VALID_WALLET.toLowerCase()
    );
  });

  it('returns 400 when artist_wallet is missing', () => {
    const result = validateGetSmartWalletQuery(makeRequest());

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when artist_wallet is not a valid Ethereum address', () => {
    const result = validateGetSmartWalletQuery(
      makeRequest({ artist_wallet: '0xabc' })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });
});
