import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/arweave/fetchUri', () => ({ default: vi.fn() }));
vi.mock('@/lib/metadata/normalizeMetadata', () => ({ default: vi.fn() }));

import getMetadataHandler from '../getMetadataHandler';
import fetchUri from '@/lib/arweave/fetchUri';
import normalizeMetadata from '@/lib/metadata/normalizeMetadata';

const mockFetchUri = vi.mocked(fetchUri);
const mockNormalize = vi.mocked(normalizeMetadata);

const makeResponse = (body: object, contentType = 'application/json') => ({
  ok: true,
  headers: { get: (h: string) => (h === 'content-type' ? contentType : null) },
  json: async () => body,
  text: async () => JSON.stringify(body),
});

describe('getMetadataHandler', () => {
  beforeEach(() => vi.clearAllMocks());

  it('fetches uri and returns normalized metadata', async () => {
    const raw = { name: 'Track', image: 'ipfs://img' };
    mockFetchUri.mockResolvedValue(makeResponse(raw) as any);
    mockNormalize.mockReturnValue({
      name: 'Track',
      image: 'ipfs://img',
      description: '',
      external_url: '',
    } as any);

    const result = await getMetadataHandler({ uri: 'ipfs://meta' });

    expect(mockFetchUri).toHaveBeenCalledWith('ipfs://meta', {
      cache: 'no-store',
    });
    expect(mockNormalize).toHaveBeenCalledWith(raw);
    expect(result).toMatchObject({ name: 'Track' });
  });

  it('parses text response when content-type is not json', async () => {
    const raw = { name: 'Track' };
    mockFetchUri.mockResolvedValue(makeResponse(raw, 'text/plain') as any);
    mockNormalize.mockReturnValue({
      name: 'Track',
      image: '',
      description: '',
      external_url: '',
    } as any);

    await getMetadataHandler({ uri: 'ar://hash' });
    expect(mockNormalize).toHaveBeenCalledWith(raw);
  });

  it('returns empty metadata on AbortError during fetch', async () => {
    const err = new Error('aborted');
    err.name = 'AbortError';
    mockFetchUri.mockRejectedValue(err);

    const result = await getMetadataHandler({ uri: 'ipfs://x' });
    expect(result).toEqual({
      image: '',
      name: '',
      description: '',
      external_url: '',
    });
  });

  it('rethrows non-abort fetch errors', async () => {
    mockFetchUri.mockRejectedValue(new Error('network error'));
    await expect(getMetadataHandler({ uri: 'ipfs://x' })).rejects.toThrow(
      'network error'
    );
  });

  it('throws when response body is not JSON', async () => {
    mockFetchUri.mockResolvedValue({
      ok: true,
      headers: { get: () => 'text/plain' },
      text: async () => 'not json at all',
    } as any);

    await expect(getMetadataHandler({ uri: 'ipfs://x' })).rejects.toThrow(
      'URI did not return JSON'
    );
  });

  it('returns empty metadata on AbortError during JSON parse', async () => {
    const err = new Error('aborted');
    err.name = 'AbortError';
    mockFetchUri.mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => {
        throw err;
      },
    } as any);

    const result = await getMetadataHandler({ uri: 'ipfs://x' });
    expect(result).toEqual({
      image: '',
      name: '',
      description: '',
      external_url: '',
    });
  });
});
