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

    it('returns undefined for optional artist when not provided', () => {
      const result = validateTransfersQuery(makeRequest());
      expect((result as any).artist).toBeUndefined();
    });

    it('returns undefined for optional collector when not provided', () => {
      const result = validateTransfersQuery(makeRequest());
      expect((result as any).collector).toBeUndefined();
    });
  });

  describe('type param', () => {
    it('accepts "airdrop"', () => {
      const result = validateTransfersQuery(makeRequest({ type: 'airdrop' }));
      expect((result as any).type).toBe('airdrop');
    });

    it('accepts "payment"', () => {
      const result = validateTransfersQuery(makeRequest({ type: 'payment' }));
      expect((result as any).type).toBe('payment');
    });

    it('returns 400 when both artist and collector are set (payment)', () => {
      const result = validateTransfersQuery(
        makeRequest({
          type: 'payment',
          artist: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
          collector: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        })
      );
      expect(result).toBeInstanceOf(NextResponse);
      expect((result as NextResponse).status).toBe(400);
    });

    it('returns 400 when both artist and collector are set (airdrop)', () => {
      const result = validateTransfersQuery(
        makeRequest({
          type: 'airdrop',
          artist: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
          collector: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        })
      );
      expect(result).toBeInstanceOf(NextResponse);
      expect((result as NextResponse).status).toBe(400);
    });

    it('returns 400 when both artist and collector are set without type', () => {
      const result = validateTransfersQuery(
        makeRequest({
          artist: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
          collector: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        })
      );
      expect(result).toBeInstanceOf(NextResponse);
      expect((result as NextResponse).status).toBe(400);
    });

    it('accepts payment with artist only', () => {
      const result = validateTransfersQuery(
        makeRequest({
          type: 'payment',
          artist: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
        })
      );
      expect((result as any).type).toBe('payment');
      expect((result as any).artist).toBe(
        '0xd8da6bf26964af9d7eed9e03e53415d37aa96045'
      );
      expect((result as any).collector).toBeUndefined();
    });

    it('accepts payment with collector only', () => {
      const result = validateTransfersQuery(
        makeRequest({
          type: 'payment',
          collector: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
        })
      );
      expect((result as any).type).toBe('payment');
      expect((result as any).collector).toBe(
        '0xd8da6bf26964af9d7eed9e03e53415d37aa96045'
      );
      expect((result as any).artist).toBeUndefined();
    });

    it('returns 400 for invalid type', () => {
      const result = validateTransfersQuery(makeRequest({ type: 'invalid' }));
      expect(result).toBeInstanceOf(NextResponse);
      expect((result as NextResponse).status).toBe(400);
    });
  });

  describe('artist param', () => {
    it('accepts a valid address and normalizes to lowercase', () => {
      const result = validateTransfersQuery(
        makeRequest({ artist: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' })
      );
      expect((result as any).artist).toBe(
        '0xd8da6bf26964af9d7eed9e03e53415d37aa96045'
      );
    });

    it('returns 400 for invalid address', () => {
      const result = validateTransfersQuery(
        makeRequest({ artist: 'not-an-address' })
      );
      expect(result).toBeInstanceOf(NextResponse);
      expect((result as NextResponse).status).toBe(400);
    });
  });

  describe('collector param', () => {
    it('accepts a valid address and normalizes to lowercase', () => {
      const result = validateTransfersQuery(
        makeRequest({ collector: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' })
      );
      expect((result as any).collector).toBe(
        '0xd8da6bf26964af9d7eed9e03e53415d37aa96045'
      );
    });

    it('returns 400 for invalid address', () => {
      const result = validateTransfersQuery(makeRequest({ collector: 'bad' }));
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
