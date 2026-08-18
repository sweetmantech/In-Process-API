import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { zeroAddress } from 'viem';

vi.mock('@/lib/consts', () => ({
  CHAIN_ID: 8453,
  IS_TESTNET: false,
}));

import validateDistributeQuery from '@/lib/splits/validateDistributeQuery';

const SPLIT = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const TOKEN = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';

const makeRequest = (params: Record<string, string> = {}) => {
  const url = new URL('http://localhost/api/splits');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url);
};

describe('validateDistributeQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 when splitAddress is missing', () => {
    const result = validateDistributeQuery(makeRequest());
    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when splitAddress is invalid', () => {
    const result = validateDistributeQuery(
      makeRequest({ splitAddress: 'not-an-address' })
    );
    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns parsed data with default tokenAddress and chainId', () => {
    const result = validateDistributeQuery(
      makeRequest({ splitAddress: SPLIT })
    );
    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as any).splitAddress).toBe(SPLIT);
    expect((result as any).tokenAddress).toBe(zeroAddress);
    expect((result as any).chainId).toBe(8453);
  });

  it('parses optional tokenAddress and chainId', () => {
    const result = validateDistributeQuery(
      makeRequest({
        splitAddress: SPLIT,
        tokenAddress: TOKEN,
        chainId: '84532',
      })
    );
    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as any).tokenAddress).toBe(TOKEN);
    expect((result as any).chainId).toBe(84532);
  });
});
