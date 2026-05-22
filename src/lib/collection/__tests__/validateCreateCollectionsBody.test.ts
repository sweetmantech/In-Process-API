import { describe, it, expect } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import validateCreateCollectionsBody from '@/lib/collection/validateCreateCollectionsBody';

const ACCOUNT = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const validItem = { uri: 'ipfs://test', name: 'Test Collection' };

const makeRequest = (body: unknown) =>
  new NextRequest('http://localhost/api/collections', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });

describe('validateCreateCollectionsBody', () => {
  it('returns parsed data for a valid body', async () => {
    const result = await validateCreateCollectionsBody(
      makeRequest({ account: ACCOUNT, collections: [validItem] })
    );
    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as any).account).toBe(ACCOUNT);
    expect((result as any).collections).toHaveLength(1);
  });

  it('returns 400 for empty collections array', async () => {
    const result = await validateCreateCollectionsBody(
      makeRequest({ account: ACCOUNT, collections: [] })
    );
    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 for missing account', async () => {
    const result = await validateCreateCollectionsBody(
      makeRequest({ collections: [validItem] })
    );
    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 for invalid account address', async () => {
    const result = await validateCreateCollectionsBody(
      makeRequest({ account: 'not-an-address', collections: [validItem] })
    );
    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 for item missing uri', async () => {
    const result = await validateCreateCollectionsBody(
      makeRequest({ account: ACCOUNT, collections: [{ name: 'Test' }] })
    );
    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('accepts multiple valid collection items', async () => {
    const result = await validateCreateCollectionsBody(
      makeRequest({
        account: ACCOUNT,
        collections: [validItem, { uri: 'ipfs://test2', name: 'Test 2' }],
      })
    );
    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as any).collections).toHaveLength(2);
  });
});
