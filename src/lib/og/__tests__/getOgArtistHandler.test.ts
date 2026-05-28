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

vi.mock('@/lib/supabase/in_process_moments/selectMoments', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/protocolSdk/ipfs/token-metadata', () => ({
  fetchTokenMetadata: vi.fn(),
}));
vi.mock('@/lib/artists/getArtistProfile', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/og/getOgFonts', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/arweave/fetchUri', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/og/getImageMetadata', () => ({
  default: vi.fn(),
}));

import { ImageResponse } from 'next/og';
import selectMoments from '@/lib/supabase/in_process_moments/selectMoments';
import { fetchTokenMetadata } from '@/lib/protocolSdk/ipfs/token-metadata';
import getArtistProfile from '@/lib/artists/getArtistProfile';
import getOgFonts from '@/lib/og/getOgFonts';
import fetchUri from '@/lib/arweave/fetchUri';
import getImageMetadata from '@/lib/og/getImageMetadata';
import getOgArtistHandler from '@/lib/og/getOgArtistHandler';
import { OG_HEIGHT, OG_WIDTH } from '@/lib/og/consts';

const ARTIST = '0x0000000000000000000000000000000000000001' as const;
const CHAIN_ID = 8453;

const mockSelectMoments = vi.mocked(selectMoments);
const mockFetchTokenMetadata = vi.mocked(fetchTokenMetadata);
const mockGetArtistProfile = vi.mocked(getArtistProfile);
const mockGetOgFonts = vi.mocked(getOgFonts);
const mockFetchUri = vi.mocked(fetchUri);
const mockGetImageMetadata = vi.mocked(getImageMetadata);

beforeEach(() => {
  vi.clearAllMocks();
  mockGetOgFonts.mockResolvedValue({
    archivo: new ArrayBuffer(1),
    spectral: new ArrayBuffer(2),
  });
  mockGetArtistProfile.mockResolvedValue({ username: 'alice' } as any);
});

describe('getOgArtistHandler', () => {
  it('returns ImageResponse sized for OG artist card', async () => {
    mockSelectMoments.mockResolvedValue({ data: [] } as any);

    const res = await getOgArtistHandler({
      artistAddress: ARTIST,
      chainId: CHAIN_ID,
    });

    expect(res).toBeInstanceOf(ImageResponse);
    expect(res).toMatchObject({
      status: 200,
      __ogOpts: { width: OG_WIDTH, height: OG_HEIGHT },
    });
  });

  it('queries moments with lowercased artist address and chainId', async () => {
    mockSelectMoments.mockResolvedValue({ data: [] } as any);

    await getOgArtistHandler({ artistAddress: ARTIST, chainId: CHAIN_ID });

    expect(mockSelectMoments).toHaveBeenCalledWith({
      artists: [ARTIST.toLowerCase()],
      chainId: CHAIN_ID,
    });
  });

  it('skips fetchTokenMetadata when artist has no moments', async () => {
    mockSelectMoments.mockResolvedValue({ data: [] } as any);

    await getOgArtistHandler({ artistAddress: ARTIST, chainId: CHAIN_ID });

    expect(mockFetchTokenMetadata).not.toHaveBeenCalled();
  });

  it('fetches metadata for the first moment when moments exist', async () => {
    mockSelectMoments.mockResolvedValue({
      data: [{ uri: 'ar://some-token-uri' }, { uri: 'ar://other-uri' }],
    } as any);
    mockFetchTokenMetadata.mockResolvedValue({ name: 'Moment 1' } as any);
    mockGetImageMetadata.mockResolvedValue(null);

    await getOgArtistHandler({ artistAddress: ARTIST, chainId: CHAIN_ID });

    expect(mockFetchTokenMetadata).toHaveBeenCalledTimes(1);
    expect(mockFetchTokenMetadata).toHaveBeenCalledWith('ar://some-token-uri');
  });

  it('fetches text content for text/plain moments', async () => {
    mockSelectMoments.mockResolvedValue({
      data: [{ uri: 'ar://token-uri' }],
    } as any);
    mockFetchTokenMetadata.mockResolvedValue({
      content: { mime: 'text/plain', uri: 'ar://body.txt' },
    } as any);
    mockFetchUri.mockResolvedValue({
      ok: true,
      text: async () => 'Hello world',
    } as any);

    await getOgArtistHandler({ artistAddress: ARTIST, chainId: CHAIN_ID });

    expect(mockFetchUri).toHaveBeenCalledWith('ar://body.txt');
    expect(mockGetImageMetadata).not.toHaveBeenCalled();
  });

  it('does not fetch content when text/plain has no content uri', async () => {
    mockSelectMoments.mockResolvedValue({
      data: [{ uri: 'ar://token-uri' }],
    } as any);
    mockFetchTokenMetadata.mockResolvedValue({
      content: { mime: 'text/plain', uri: undefined },
    } as any);

    await getOgArtistHandler({ artistAddress: ARTIST, chainId: CHAIN_ID });

    expect(mockFetchUri).not.toHaveBeenCalled();
  });

  it('fetches image metadata for image moments', async () => {
    mockSelectMoments.mockResolvedValue({
      data: [{ uri: 'ar://token-uri' }],
    } as any);
    mockFetchTokenMetadata.mockResolvedValue({
      image: 'ar://cover.png',
      content: { mime: 'image/png' },
    } as any);
    mockGetImageMetadata.mockResolvedValue({
      orientation: 1,
      originalWidth: 200,
      originalHeight: 200,
      shouldRotate: false,
      previewUrl: 'data:image/png;base64,abc',
    });

    await getOgArtistHandler({ artistAddress: ARTIST, chainId: CHAIN_ID });

    expect(mockGetImageMetadata).toHaveBeenCalledWith('ar://cover.png');
    expect(mockFetchUri).not.toHaveBeenCalled();
  });

  it('calls getArtistProfile with the lowercased artist address', async () => {
    mockSelectMoments.mockResolvedValue({ data: [] } as any);

    await getOgArtistHandler({ artistAddress: ARTIST, chainId: CHAIN_ID });

    expect(mockGetArtistProfile).toHaveBeenCalledWith(ARTIST.toLowerCase());
  });

  it('calls getOgFonts to load fonts', async () => {
    mockSelectMoments.mockResolvedValue({ data: [] } as any);

    await getOgArtistHandler({ artistAddress: ARTIST, chainId: CHAIN_ID });

    expect(mockGetOgFonts).toHaveBeenCalledTimes(1);
  });
});
