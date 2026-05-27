import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('next/og', () => ({
  ImageResponse: class MockImageResponse {
    __ogOpts: { width: number; height: number };
    status = 200;
    constructor(
      _el: unknown,
      opts: { width: number; height: number; fonts?: unknown[] }
    ) {
      this.__ogOpts = { width: opts.width, height: opts.height };
    }
  },
}));

vi.mock('@/lib/supabase/in_process_moments/getArtistTimeline', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/artists/getArtistProfile', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/og/getArchivoFont', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/og/collectCollageImages', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/truncateAddress', () => ({
  default: vi.fn(),
}));

import { ImageResponse } from 'next/og';
import getArtistTimeline from '@/lib/supabase/in_process_moments/getArtistTimeline';
import getArtistProfile from '@/lib/artists/getArtistProfile';
import getArchivoFont from '@/lib/og/getArchivoFont';
import collectCollageImages from '@/lib/og/collectCollageImages';
import truncateAddress from '@/lib/truncateAddress';
import getArtistCollageHandler from '@/lib/og/getArtistCollageHandler';

const ARTIST = '0x0000000000000000000000000000000000000001' as const;
const CHAIN_ID = 8453;

const COLLAGE_WIDTH = 700;
const COLLAGE_HEIGHT = 350;

const mockGetArtistTimeline = vi.mocked(getArtistTimeline);
const mockGetArtistProfile = vi.mocked(getArtistProfile);
const mockGetArchivoFont = vi.mocked(getArchivoFont);
const mockCollectCollageImages = vi.mocked(collectCollageImages);
const mockTruncateAddress = vi.mocked(truncateAddress);

const makeTimeline = (
  moments: { metadata?: { image?: string }; created_at: string }[],
  totalPages = 1
) => ({
  data: {
    moments,
    pagination: { total_pages: totalPages },
  },
});

beforeEach(() => {
  vi.clearAllMocks();
  mockGetArchivoFont.mockResolvedValue(new ArrayBuffer(1));
  mockGetArtistProfile.mockResolvedValue({ username: 'alice' } as any);
  mockCollectCollageImages.mockResolvedValue([]);
});

describe('getArtistCollageHandler', () => {
  it('returns ImageResponse sized 700×350', async () => {
    mockGetArtistTimeline.mockResolvedValue(makeTimeline([]) as any);

    const res = await getArtistCollageHandler({
      artistAddress: ARTIST,
      chainId: CHAIN_ID,
    });

    expect(res).toBeInstanceOf(ImageResponse);
    expect(res).toMatchObject({
      status: 200,
      __ogOpts: { width: COLLAGE_WIDTH, height: COLLAGE_HEIGHT },
    });
  });

  it('queries getArtistTimeline with correct params', async () => {
    mockGetArtistTimeline.mockResolvedValue(makeTimeline([]) as any);

    await getArtistCollageHandler({ artistAddress: ARTIST, chainId: CHAIN_ID });

    expect(mockGetArtistTimeline).toHaveBeenCalledWith({
      artist: ARTIST,
      limit: 100,
      page: 1,
      chainId: CHAIN_ID,
    });
  });

  it('calls getArtistProfile with the artist address', async () => {
    mockGetArtistTimeline.mockResolvedValue(makeTimeline([]) as any);

    await getArtistCollageHandler({ artistAddress: ARTIST, chainId: CHAIN_ID });

    expect(mockGetArtistProfile).toHaveBeenCalledWith(ARTIST);
  });

  it('passes only moments with metadata.image to collectCollageImages', async () => {
    mockGetArtistTimeline.mockResolvedValue(
      makeTimeline([
        { metadata: { image: 'ar://img1' }, created_at: '2024-01-01' },
        { metadata: undefined, created_at: '2024-01-02' },
        { metadata: { image: 'ar://img3' }, created_at: '2024-01-03' },
      ]) as any
    );

    await getArtistCollageHandler({ artistAddress: ARTIST, chainId: CHAIN_ID });

    expect(mockCollectCollageImages).toHaveBeenCalledWith([
      { imageUrl: 'ar://img1', createdAt: '2024-01-01' },
      { imageUrl: 'ar://img3', createdAt: '2024-01-03' },
    ]);
  });

  it('passes at most 5 images to collectCollageImages', async () => {
    const moments = Array.from({ length: 8 }, (_, i) => ({
      metadata: { image: `ar://img${i}` },
      created_at: `2024-01-0${i + 1}`,
    }));
    mockGetArtistTimeline.mockResolvedValue(makeTimeline(moments) as any);

    await getArtistCollageHandler({ artistAddress: ARTIST, chainId: CHAIN_ID });

    const call = mockCollectCollageImages.mock.calls[0][0];
    expect(call).toHaveLength(5);
  });

  it('computes totalMoments as total_pages × 100', async () => {
    mockGetArtistTimeline.mockResolvedValue(makeTimeline([], 3) as any);

    await getArtistCollageHandler({ artistAddress: ARTIST, chainId: CHAIN_ID });

    expect(mockCollectCollageImages).toHaveBeenCalled();
  });

  it('falls back to truncateAddress when username is absent', async () => {
    mockGetArtistTimeline.mockResolvedValue(makeTimeline([]) as any);
    mockGetArtistProfile.mockResolvedValue({ username: '' } as any);
    mockTruncateAddress.mockReturnValue('0x0001...0001');

    await getArtistCollageHandler({ artistAddress: ARTIST, chainId: CHAIN_ID });

    expect(mockTruncateAddress).toHaveBeenCalledWith(ARTIST);
  });

  it('does not call truncateAddress when username is present', async () => {
    mockGetArtistTimeline.mockResolvedValue(makeTimeline([]) as any);
    mockGetArtistProfile.mockResolvedValue({ username: 'alice' } as any);

    await getArtistCollageHandler({ artistAddress: ARTIST, chainId: CHAIN_ID });

    expect(mockTruncateAddress).not.toHaveBeenCalled();
  });

  it('uses chainId undefined when omitted', async () => {
    mockGetArtistTimeline.mockResolvedValue(makeTimeline([]) as any);

    await getArtistCollageHandler({ artistAddress: ARTIST });

    expect(mockGetArtistTimeline).toHaveBeenCalledWith(
      expect.objectContaining({ chainId: undefined })
    );
  });
});
