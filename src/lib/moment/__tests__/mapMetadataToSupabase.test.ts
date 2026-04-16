import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/metadata/getMetadataHandler', () => ({ default: vi.fn() }));
vi.mock('@/lib/sleep', () => ({
  default: vi.fn().mockResolvedValue(undefined),
}));

import { mapMetadataToSupabase } from '../mapMetadataToSupabase';
import getMetadataHandler from '@/lib/metadata/getMetadataHandler';

const mockGetMetadata = vi.mocked(getMetadataHandler);

describe('mapMetadataToSupabase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns empty records for empty input', async () => {
    const result = await mapMetadataToSupabase([]);
    expect(result.records).toEqual([]);
    expect(result.artistNamesByAddresses.size).toBe(0);
  });

  it('maps metadata to supabase insert shape', async () => {
    mockGetMetadata.mockResolvedValue({
      name: 'Track 1',
      description: 'Desc',
      image: 'ipfs://img',
      animation_url: 'ar://anim',
      external_url: 'https://example.com',
      content: null,
      artist: 'Alice',
    } as any);

    const moments = [
      { id: 'mid', uri: 'ipfs://meta', collection: { creator: '0xABC' } },
    ];
    const result = await mapMetadataToSupabase(moments);

    expect(result.records).toHaveLength(1);
    expect(result.records[0]).toMatchObject({
      moment: 'mid',
      name: 'Track 1',
      description: 'Desc',
      image: 'ipfs://img',
      animation_url: 'ar://anim',
      external_url: 'https://example.com',
    });
  });

  it('tracks artist names by creator address', async () => {
    mockGetMetadata.mockResolvedValue({
      artist: 'Alice',
      name: 'T',
      description: null,
      image: null,
      animation_url: null,
      external_url: null,
      content: null,
    } as any);

    const moments = [
      { id: 'mid', uri: 'ipfs://meta', collection: { creator: '0xABC' } },
    ];
    const result = await mapMetadataToSupabase(moments);

    expect(result.artistNamesByAddresses.get('0xABC')).toBe('Alice');
  });

  it('does not add to artistNames when artist field is missing', async () => {
    mockGetMetadata.mockResolvedValue({
      name: 'T',
      description: null,
      image: null,
      animation_url: null,
      external_url: null,
      content: null,
    } as any);

    const moments = [
      { id: 'mid', uri: 'ipfs://meta', collection: { creator: '0xABC' } },
    ];
    const result = await mapMetadataToSupabase(moments);

    expect(result.artistNamesByAddresses.size).toBe(0);
  });

  it('passes contentUri to getMetadataHandler', async () => {
    mockGetMetadata.mockResolvedValue({ name: 'T', artist: 'Alice' } as any);

    const moments = [
      {
        id: 'mid',
        uri: 'ipfs://metadata',
        contentUri: 'ipfs://content',
        collection: { creator: '0xABC' },
      },
    ];
    await mapMetadataToSupabase(moments);

    expect(mockGetMetadata).toHaveBeenCalledWith({
      uri: 'ipfs://metadata',
      contentUri: 'ipfs://content',
    });
  });

  it('uses owner address over collection.creator for artist name mapping', async () => {
    mockGetMetadata.mockResolvedValue({ name: 'T', artist: 'Alice' } as any);

    const moments = [
      {
        id: 'mid',
        uri: 'ipfs://meta',
        owner: '0xOWNER',
        collection: { creator: '0xCREATOR' },
      },
    ];
    const result = await mapMetadataToSupabase(moments);

    expect(result.artistNamesByAddresses.get('0xOWNER')).toBe('Alice');
    expect(result.artistNamesByAddresses.has('0xCREATOR')).toBe(false);
  });

  it('retries up to 3 times on failure, then logs and continues', async () => {
    mockGetMetadata.mockRejectedValue(new Error('fetch failed'));

    const moments = [
      { id: 'mid', uri: 'bad://uri', collection: { creator: '0xABC' } },
    ];
    const result = await mapMetadataToSupabase(moments);

    // After all retries fail, the record is simply not added
    expect(result.records).toHaveLength(0);
    expect(mockGetMetadata).toHaveBeenCalledTimes(3);
  });

  it('stops retrying after success', async () => {
    mockGetMetadata
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce({
        name: 'T',
        description: null,
        image: null,
        animation_url: null,
        external_url: null,
        content: null,
      } as any);

    const moments = [
      { id: 'mid', uri: 'ipfs://meta', collection: { creator: '0xABC' } },
    ];
    const result = await mapMetadataToSupabase(moments);

    expect(result.records).toHaveLength(1);
    expect(mockGetMetadata).toHaveBeenCalledTimes(2);
  });
});
