import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/arweave/fetchUri', () => ({
  default: vi.fn(),
}));

import fetchUri from '@/lib/arweave/fetchUri';
import getMomentMime from '@/lib/moment/getMomentMime';

const mockFetchUri = vi.mocked(fetchUri);

const mockResponse = (body: object) =>
  ({ json: () => Promise.resolve(body) }) as any;

describe('getMomentMime', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the mime type from metadata content', async () => {
    mockFetchUri.mockResolvedValue(
      mockResponse({ content: { mime: 'video/mp4', uri: 'ar://hash' } })
    );

    expect(await getMomentMime('ar://metadata-hash')).toBe('video/mp4');
  });

  it('returns null when content field is absent', async () => {
    mockFetchUri.mockResolvedValue(mockResponse({ name: 'My Moment' }));

    expect(await getMomentMime('ar://metadata-hash')).toBeNull();
  });

  it('returns null when content.mime is absent', async () => {
    mockFetchUri.mockResolvedValue(
      mockResponse({ content: { uri: 'ar://hash' } })
    );

    expect(await getMomentMime('ar://metadata-hash')).toBeNull();
  });

  it('calls fetchUri with the provided URI', async () => {
    mockFetchUri.mockResolvedValue(
      mockResponse({ content: { mime: 'image/jpeg' } })
    );

    await getMomentMime('https://example.com/metadata.json');

    expect(mockFetchUri).toHaveBeenCalledWith(
      'https://example.com/metadata.json'
    );
  });

  it('propagates errors from fetchUri', async () => {
    mockFetchUri.mockRejectedValue(new Error('Network error'));

    await expect(getMomentMime('ar://bad')).rejects.toThrow('Network error');
  });
});
