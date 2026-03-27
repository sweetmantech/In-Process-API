import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Address } from 'viem';
import createMomentFromYoutubeLink from '../createMomentFromYoutubeLink';

vi.mock('@/lib/link/getYoutubeDetail', () => ({ default: vi.fn() }));
vi.mock('@/lib/arweave/uploadToArweave', () => ({ default: vi.fn() }));
vi.mock('@/lib/arweave/uploadJson', () => ({ uploadJson: vi.fn() }));
vi.mock('@/lib/moment/createMoment', () => ({ createMoment: vi.fn() }));
vi.mock('@/lib/consts', () => ({
  CHAIN_ID: 8453,
  REFERRAL_RECIPIENT: '0xReferral',
  USDC_ADDRESS: { 8453: '0xUsdc' },
  IS_TESTNET: false,
}));

import getYoutubeDetail from '@/lib/link/getYoutubeDetail';
import uploadToArweave from '@/lib/arweave/uploadToArweave';
import { uploadJson } from '@/lib/arweave/uploadJson';
import { createMoment } from '@/lib/moment/createMoment';

const ARTIST_ADDRESS = '0xArtist' as Address;
const YOUTUBE_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
const THUMBNAIL_URL = 'https://img.youtube.com/vi/dQw4w9WgXcQ/default.jpg';

const DETAIL = {
  siteName: 'youtube',
  title: 'Never Gonna Give You Up',
  description: 'The classic',
  images: [THUMBNAIL_URL],
  favicons: [],
  url: YOUTUBE_URL,
};

const MOMENT_RESULT = {
  contractAddress: '0xContract' as Address,
  tokenId: '1',
};

const makeFetchResponse = (contentType: string | null = 'image/jpeg') => ({
  headers: { get: vi.fn().mockReturnValue(contentType) },
  blob: vi.fn().mockResolvedValue(new Blob(['img'], { type: 'image/jpeg' })),
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getYoutubeDetail).mockResolvedValue(DETAIL);
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeFetchResponse()));
  vi.mocked(uploadToArweave).mockResolvedValue('ar://image-hash');
  vi.mocked(uploadJson).mockResolvedValue('ar://metadata-hash');
  vi.mocked(createMoment).mockResolvedValue(MOMENT_RESULT as never);
});

describe('createMomentFromYoutubeLink', () => {
  it('throws when getYoutubeDetail returns null', async () => {
    vi.mocked(getYoutubeDetail).mockResolvedValue(null);

    await expect(
      createMomentFromYoutubeLink(YOUTUBE_URL, ARTIST_ADDRESS)
    ).rejects.toThrow('Failed to fetch YouTube details');
  });

  it('fetches the thumbnail from detail.images[0]', async () => {
    await createMomentFromYoutubeLink(YOUTUBE_URL, ARTIST_ADDRESS);

    expect(fetch).toHaveBeenCalledWith(THUMBNAIL_URL);
  });

  it('uploads thumbnail file to Arweave with the correct content-type', async () => {
    await createMomentFromYoutubeLink(YOUTUBE_URL, ARTIST_ADDRESS);

    expect(uploadToArweave).toHaveBeenCalledOnce();
    const [file] = vi.mocked(uploadToArweave).mock.calls[0];
    expect(file.type).toBe('image/jpeg');
  });

  it('falls back to favicons[0] when images[0] is undefined', async () => {
    const faviconUrl = 'https://example.com/favicon.ico';
    vi.mocked(getYoutubeDetail).mockResolvedValue({
      ...DETAIL,
      images: [],
      favicons: [faviconUrl],
    });

    await createMomentFromYoutubeLink(YOUTUBE_URL, ARTIST_ADDRESS);

    expect(fetch).toHaveBeenCalledWith(faviconUrl);
  });

  it('skips thumbnail fetch and uses empty imageUri when images[0] is undefined', async () => {
    vi.mocked(getYoutubeDetail).mockResolvedValue({ ...DETAIL, images: [] });

    await createMomentFromYoutubeLink(YOUTUBE_URL, ARTIST_ADDRESS);

    expect(fetch).not.toHaveBeenCalled();
    expect(uploadToArweave).not.toHaveBeenCalled();
    expect(uploadJson).toHaveBeenCalledWith(
      expect.objectContaining({
        image: '',
        content: { mime: 'image/jpeg', uri: '' },
      })
    );
  });

  it('falls back to image/jpeg when content-type header is missing', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeFetchResponse(null)));

    await createMomentFromYoutubeLink(YOUTUBE_URL, ARTIST_ADDRESS);

    const [file] = vi.mocked(uploadToArweave).mock.calls[0];
    expect(file.type).toBe('image/jpeg');
  });

  it('uploads JSON metadata with correct fields', async () => {
    await createMomentFromYoutubeLink(YOUTUBE_URL, ARTIST_ADDRESS);

    expect(uploadJson).toHaveBeenCalledWith({
      name: DETAIL.title,
      description: DETAIL.description,
      image: 'ar://image-hash',
      external_url: YOUTUBE_URL,
      content: { mime: 'image/jpeg', uri: 'ar://image-hash' },
    });
  });

  it('calls createMoment with metadataUri, title, and artistAddress', async () => {
    await createMomentFromYoutubeLink(YOUTUBE_URL, ARTIST_ADDRESS);

    const call = vi.mocked(createMoment).mock.calls[0][0];
    expect(call.contract.uri).toBe('ar://metadata-hash');
    expect(call.contract.name).toBe(DETAIL.title);
    expect(call.account).toBe(ARTIST_ADDRESS);
    expect(call.channel).toBe('telegram');
  });

  it('falls back to "Untitled Video" when detail.title is empty', async () => {
    vi.mocked(getYoutubeDetail).mockResolvedValue({ ...DETAIL, title: '' });

    await createMomentFromYoutubeLink(YOUTUBE_URL, ARTIST_ADDRESS);

    const call = vi.mocked(createMoment).mock.calls[0][0];
    expect(call.contract.name).toBe('Untitled Video');
  });

  it('returns contractAddress and tokenId', async () => {
    const result = await createMomentFromYoutubeLink(
      YOUTUBE_URL,
      ARTIST_ADDRESS
    );

    expect(result).toEqual(MOMENT_RESULT);
  });
});
