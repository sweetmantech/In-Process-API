import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import validateMuxAssetQuery from '../validateMuxAssetQuery';

const makeRequest = (params: Record<string, string> = {}) => {
  const url = new URL('http://localhost/api/mux/asset');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url);
};

describe('validateMuxAssetQuery', () => {
  it('returns uploadId when valid', () => {
    const result = validateMuxAssetQuery(
      makeRequest({ uploadId: 'upload-123' })
    );
    expect(result).toEqual({ uploadId: 'upload-123' });
  });

  it('returns 400 when uploadId is missing', async () => {
    const result = validateMuxAssetQuery(makeRequest());
    expect(result).toHaveProperty('status', 400);
    const body = await (result as Response).json();
    expect(body.message).toBe('uploadId is required');
  });
});
