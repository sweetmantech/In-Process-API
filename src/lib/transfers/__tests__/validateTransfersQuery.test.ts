import { describe, it, expect } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import validateTransfersQuery from '@/lib/transfers/validateTransfersQuery';

const makeRequest = (params: Record<string, string> = {}) => {
  const url = new URL('http://localhost/api/transfers');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url);
};

describe('validateTransfersQuery', () => {
  describe('defaults', () => {
    it('defaults limit to 20', () => {
      const result = validateTransfersQuery(makeRequest());
      expect((result as any).limit).toBe(20);
    });

    it('defaults page to 1', () => {
      const result = validateTransfersQuery(makeRequest());
      expect((result as any).page).toBe(1);
    });

    it('defaults chainId to the env chain id', () => {
      const result = validateTransfersQuery(makeRequest());
      expect(typeof (result as any).chainId).toBe('number');
    });

    it('returns undefined for optional type when not provided', () => {
      const result = validateTransfersQuery(makeRequest());
      expect((result as any).type).toBeUndefined();
    });

    it('returns undefined for optional spender when not provided', () => {
      const result = validateTransfersQuery(makeRequest());
      expect((result as any).spender).toBeUndefined();
    });

    it('returns undefined for optional recipient when not provided', () => {
      const result = validateTransfersQuery(makeRequest());
      expect((result as any).recipient).toBeUndefined();
    });
  });

  describe('type param', () => {
    it('accepts "airdrop"', () => {
      const result = validateTransfersQuery(makeRequest({ type: 'airdrop' }));
      expect((result as any).type).toBe('airdrop');
    });

    it('returns 400 for invalid type', () => {
      const result = validateTransfersQuery(makeRequest({ type: 'invalid' }));
      expect(result).toBeInstanceOf(NextResponse);
      expect((result as NextResponse).status).toBe(400);
    });
  });

  describe('spender param', () => {
    it('accepts a valid address and normalizes to lowercase', () => {
      const result = validateTransfersQuery(
        makeRequest({ spender: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' })
      );
      expect((result as any).spender).toBe(
        '0xd8da6bf26964af9d7eed9e03e53415d37aa96045'
      );
    });

    it('returns 400 for invalid address', () => {
      const result = validateTransfersQuery(
        makeRequest({ spender: 'not-an-address' })
      );
      expect(result).toBeInstanceOf(NextResponse);
      expect((result as NextResponse).status).toBe(400);
    });
  });

  describe('recipient param', () => {
    it('accepts a valid address and normalizes to lowercase', () => {
      const result = validateTransfersQuery(
        makeRequest({ recipient: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' })
      );
      expect((result as any).recipient).toBe(
        '0xd8da6bf26964af9d7eed9e03e53415d37aa96045'
      );
    });

    it('returns 400 for invalid address', () => {
      const result = validateTransfersQuery(makeRequest({ recipient: 'bad' }));
      expect(result).toBeInstanceOf(NextResponse);
      expect((result as NextResponse).status).toBe(400);
    });
  });

  describe('limit param', () => {
    it('accepts a valid limit', () => {
      const result = validateTransfersQuery(makeRequest({ limit: '50' }));
      expect((result as any).limit).toBe(50);
    });

    it('returns 400 when limit exceeds 100', () => {
      const result = validateTransfersQuery(makeRequest({ limit: '101' }));
      expect(result).toBeInstanceOf(NextResponse);
      expect((result as NextResponse).status).toBe(400);
    });

    it('returns 400 when limit is 0', () => {
      const result = validateTransfersQuery(makeRequest({ limit: '0' }));
      expect(result).toBeInstanceOf(NextResponse);
      expect((result as NextResponse).status).toBe(400);
    });
  });

  describe('page param', () => {
    it('accepts a valid page', () => {
      const result = validateTransfersQuery(makeRequest({ page: '3' }));
      expect((result as any).page).toBe(3);
    });

    it('returns 400 when page is 0', () => {
      const result = validateTransfersQuery(makeRequest({ page: '0' }));
      expect(result).toBeInstanceOf(NextResponse);
      expect((result as NextResponse).status).toBe(400);
    });
  });

  describe('chainId param', () => {
    it('accepts chainId 8453', () => {
      const result = validateTransfersQuery(makeRequest({ chainId: '8453' }));
      expect((result as any).chainId).toBe(8453);
    });
  });
});
