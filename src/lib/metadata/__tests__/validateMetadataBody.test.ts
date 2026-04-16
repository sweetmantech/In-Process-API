import { describe, it, expect } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import validateMetadataQuery from '@/lib/metadata/validateMetadataQuery';

const makeRequest = (body: unknown) =>
  new NextRequest('http://localhost/api/metadata', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });

describe('validateMetadataQuery', () => {
  it('returns uri when present', async () => {
    const result = await validateMetadataQuery(
      makeRequest({ uri: 'ipfs://QmABC' })
    );
    expect(result).toEqual({ uri: 'ipfs://QmABC', contentUri: undefined });
  });

  it('returns uri and content_uri when both are present', async () => {
    const result = await validateMetadataQuery(
      makeRequest({ uri: 'ipfs://QmABC', content_uri: 'ar://contentHash' })
    );
    expect(result).toEqual({
      uri: 'ipfs://QmABC',
      contentUri: 'ar://contentHash',
    });
  });

  it('returns 400 when uri is missing', async () => {
    const result = await validateMetadataQuery(makeRequest({}));
    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when body is malformed JSON', async () => {
    const req = new NextRequest('http://localhost/api/metadata', {
      method: 'POST',
      body: 'not json',
      headers: { 'Content-Type': 'application/json' },
    });

    const result = await validateMetadataQuery(req);
    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
    const json = await (result as NextResponse).json();
    expect(json.errors[0].message).toBe('Malformed JSON body');
  });
});
