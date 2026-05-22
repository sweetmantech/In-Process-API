import { describe, it, expect } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import validateCreateCollectionBody from '@/lib/collection/validateCreateCollectionBody';

const ACCOUNT = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const validItem = { uri: 'ipfs://test', name: 'Test Collection' };

const makeRequest = (body: unknown) =>
  new NextRequest('http://localhost/api/collections', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });

describe('validateCreateCollectionBody', () => {
  it('returns parsed data for a valid body', async () => {
    const result = await validateCreateCollectionBody(
      makeRequest({ account: ACCOUNT, collection: validItem })
    );
    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as any).account).toBe(ACCOUNT);
    expect((result as any).collection).toEqual(validItem);
  });

  it('returns 400 for missing account', async () => {
    const result = await validateCreateCollectionBody(
      makeRequest({ collection: validItem })
    );
    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 for invalid account address', async () => {
    const result = await validateCreateCollectionBody(
      makeRequest({ account: 'not-an-address', collection: validItem })
    );
    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 for item missing uri', async () => {
    const result = await validateCreateCollectionBody(
      makeRequest({ account: ACCOUNT, collection: { name: 'Test' } })
    );
    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 for missing collection', async () => {
    const result = await validateCreateCollectionBody(
      makeRequest({ account: ACCOUNT })
    );
    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });
});
