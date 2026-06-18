import { describe, it, expect } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import validateGetSmartWalletQuery from '@/lib/smartwallets/validateGetSmartWalletQuery';

const ARTIST_ID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
const WALLET_ADDRESS = '0x1234567890abcdef1234567890abcdef12345678';

const makeRequest = (params: Record<string, string> = {}) => {
  const url = new URL('http://localhost/api/smartwallet');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url);
};

describe('validateGetSmartWalletQuery', () => {
  it('returns validated data when accountId is provided', () => {
    const result = validateGetSmartWalletQuery(
      makeRequest({ accountId: ARTIST_ID })
    );

    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as { accountId: string }).accountId).toBe(ARTIST_ID);
  });

  it('returns validated data when walletAddress is provided', () => {
    const result = validateGetSmartWalletQuery(
      makeRequest({ walletAddress: WALLET_ADDRESS })
    );

    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as { walletAddress: string }).walletAddress).toBe(
      WALLET_ADDRESS
    );
  });

  it('returns validated data when both accountId and walletAddress are provided', () => {
    const result = validateGetSmartWalletQuery(
      makeRequest({ accountId: ARTIST_ID, walletAddress: WALLET_ADDRESS })
    );

    expect(result).not.toBeInstanceOf(NextResponse);
    expect(
      (result as { accountId: string; walletAddress: string }).accountId
    ).toBe(ARTIST_ID);
    expect(
      (result as { accountId: string; walletAddress: string }).walletAddress
    ).toBe(WALLET_ADDRESS);
  });

  it('returns 400 when neither accountId nor walletAddress is provided', () => {
    const result = validateGetSmartWalletQuery(makeRequest());

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });
});
