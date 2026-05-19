import { describe, it, expect } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

import validateCreateCollectionBody from '@/lib/collection/validateCreateCollectionBody';

const ACCOUNT = '0xaf1452d289e22fbd0dea9d5097353c72a90fac33';

const makeRequest = (body: unknown) =>
  new NextRequest('http://localhost/api/collection', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });

const validBody = {
  account: ACCOUNT,
  uri: 'ar://some-hash',
  name: 'My Collection',
};

describe('validateCreateCollectionBody', () => {
  it('returns validated data for valid input', async () => {
    const result = await validateCreateCollectionBody(makeRequest(validBody));

    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as any).account).toBe(ACCOUNT);
    expect((result as any).uri).toBe('ar://some-hash');
    expect((result as any).name).toBe('My Collection');
  });

  it('returns 400 when account is missing', async () => {
    const result = await validateCreateCollectionBody(
      makeRequest({ uri: 'ar://x', name: 'Test' })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when account is not a valid address', async () => {
    const result = await validateCreateCollectionBody(
      makeRequest({ ...validBody, account: 'not-an-address' })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when uri is missing', async () => {
    const result = await validateCreateCollectionBody(
      makeRequest({ account: ACCOUNT, name: 'Test' })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when name is missing', async () => {
    const result = await validateCreateCollectionBody(
      makeRequest({ account: ACCOUNT, uri: 'ar://x' })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when splits has only one recipient', async () => {
    const result = await validateCreateCollectionBody(
      makeRequest({
        ...validBody,
        splits: [{ address: ACCOUNT, percentAllocation: 100 }],
      })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when splits total does not equal 100', async () => {
    const result = await validateCreateCollectionBody(
      makeRequest({
        ...validBody,
        splits: [
          { address: '0xaf1452d289e22fbd0dea9d5097353c72a90fac33', percentAllocation: 50 },
          { address: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb01', percentAllocation: 40 },
        ],
      })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('accepts valid splits totalling 100', async () => {
    const result = await validateCreateCollectionBody(
      makeRequest({
        ...validBody,
        splits: [
          { address: '0xaf1452d289e22fbd0dea9d5097353c72a90fac33', percentAllocation: 60 },
          { address: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb01', percentAllocation: 40 },
        ],
      })
    );

    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as any).splits).toHaveLength(2);
  });
});
