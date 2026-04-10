import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import validateMetadataQuery from '../validateMetadataQuery';

const makeRequest = (uri?: string) =>
  new NextRequest(
    `http://localhost/api/metadata${uri ? `?uri=${encodeURIComponent(uri)}` : ''}`
  );

describe('validateMetadataQuery', () => {
  it('returns uri when present', () => {
    const req = makeRequest('ipfs://QmABC');
    const result = validateMetadataQuery(req);
    expect(result).toEqual({ uri: 'ipfs://QmABC' });
  });

  it('returns 400 when uri param is missing', () => {
    const req = makeRequest();
    const result = validateMetadataQuery(req);
    expect(result).toBeInstanceOf(Response);
    // @ts-ignore
    expect(result.status).toBe(400);
  });

  it('accepts ar:// URIs', () => {
    const req = makeRequest('ar://someHash');
    const result = validateMetadataQuery(req);
    expect(result).toEqual({ uri: 'ar://someHash' });
  });

  it('accepts https:// URIs', () => {
    const req = makeRequest('https://example.com/meta.json');
    const result = validateMetadataQuery(req);
    expect(result).toEqual({ uri: 'https://example.com/meta.json' });
  });
});
