import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAddress, type Address } from 'viem';
import createMomentFromYoutubeLink from '../createMomentFromYoutubeLink';

vi.mock('@/lib/link/getYoutubeDetail', () => ({ default: vi.fn() }));
vi.mock('@/lib/arweave/uploadToArweave', () => ({ default: vi.fn() }));
vi.mock('@/lib/arweave/logArweaveUpload', () => ({ default: vi.fn() }));
vi.mock('@/lib/arweave/uploadJson', () => ({ uploadJson: vi.fn() }));
vi.mock('@/lib/moment/createMomentBatch', () => ({ default: vi.fn() }));
vi.mock('@/lib/consts', () => ({
  CHAIN_ID: 8453,
  REFERRAL_RECIPIENT: '0x1111111111111111111111111111111111111111',
  USDC_ADDRESS: {
    8453: '0x2222222222222222222222222222222222222222',
  },
  IS_TESTNET: false,
}));

import getYoutubeDetail from '@/lib/link/getYoutubeDetail';
import uploadToArweave from '@/lib/arweave/uploadToArweave';
import { uploadJson } from '@/lib/arweave/uploadJson';
import createMomentBatch from '@/lib/moment/createMomentBatch';

const ARTIST_ADDRESS = '0x0000000000000000000000000000000000000123' as Address;
const ARTIST_CONTEXT = {
  artistId: 'artist-uuid-123',
  primaryWallet: ARTIST_ADDRESS,
  wallets: [{ address: ARTIST_ADDRESS, type: 'external' as const }],
};
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
  hash: '0x1111111111111111111111111111111111111111111111111111111111111111' as const,
  chainId: 8453,
};

const makeFetchResponse = (contentType: string | null = 'image/jpeg') => ({
  headers: { get: vi.fn().mockReturnValue(contentType) },
  blob: vi.fn().mockResolvedValue(new Blob(['img'], { type: 'image/jpeg' })),
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getYoutubeDetail).mockResolvedValue(DETAIL);
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeFetchResponse()));
  vi.mocked(uploadToArweave).mockResolvedValue({
    arweave_uri: 'ar://image-hash',
    winc_cost: '100',
  });
  vi.mocked(uploadJson).mockResolvedValue({
    arweave_uri: 'ar://metadata-hash',
    winc_cost: '100',
  });
  vi.mocked(createMomentBatch).mockResolvedValue({
    contractAddress: MOMENT_RESULT.contractAddress,
    tokenIds: [MOMENT_RESULT.tokenId],
    hash: MOMENT_RESULT.hash,
    chainId: MOMENT_RESULT.chainId,
  } as never);
});

describe('createMomentFromYoutubeLink', () => {
  it('throws when getYoutubeDetail returns null', async () => {
    vi.mocked(getYoutubeDetail).mockResolvedValue(null);

    await expect(
      createMomentFromYoutubeLink(YOUTUBE_URL, ARTIST_CONTEXT)
    ).rejects.toThrow('Failed to fetch YouTube details');
  });

  it('fetches the thumbnail from detail.images[0]', async () => {
    await createMomentFromYoutubeLink(YOUTUBE_URL, ARTIST_CONTEXT);

    expect(fetch).toHaveBeenCalledWith(THUMBNAIL_URL);
  });

  it('uploads thumbnail file to Arweave with the correct content-type', async () => {
    await createMomentFromYoutubeLink(YOUTUBE_URL, ARTIST_CONTEXT);

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

    await createMomentFromYoutubeLink(YOUTUBE_URL, ARTIST_CONTEXT);

    expect(fetch).toHaveBeenCalledWith(faviconUrl);
  });

  it('skips thumbnail fetch and uses empty imageUri when images[0] is undefined', async () => {
    vi.mocked(getYoutubeDetail).mockResolvedValue({ ...DETAIL, images: [] });

    await createMomentFromYoutubeLink(YOUTUBE_URL, ARTIST_CONTEXT);

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

    await createMomentFromYoutubeLink(YOUTUBE_URL, ARTIST_CONTEXT);

    const [file] = vi.mocked(uploadToArweave).mock.calls[0];
    expect(file.type).toBe('image/jpeg');
  });

  it('uploads JSON metadata with correct fields', async () => {
    await createMomentFromYoutubeLink(YOUTUBE_URL, ARTIST_CONTEXT);

    expect(uploadJson).toHaveBeenCalledWith({
      name: DETAIL.title,
      description: DETAIL.description,
      image: 'ar://image-hash',
      external_url: YOUTUBE_URL,
      content: { mime: 'image/jpeg', uri: 'ar://image-hash' },
    });
  });

  it('calls createMomentBatch with metadataUri, title, and artistAddress', async () => {
    await createMomentFromYoutubeLink(YOUTUBE_URL, ARTIST_CONTEXT);

    const [input] = vi.mocked(createMomentBatch).mock.calls[0];
    expect(input.contract.uri).toBe('ar://metadata-hash');
    expect(input.contract.name).toBe(DETAIL.title);
    expect(input.account).toBe(getAddress(ARTIST_ADDRESS));
    expect(input.channel).toBe('telegram');
    expect(input.tokens).toHaveLength(1);
    expect(input.tokens[0].tokenMetadataURI).toBe('ar://metadata-hash');
  });

  it('falls back to "Untitled Video" when detail.title is empty', async () => {
    vi.mocked(getYoutubeDetail).mockResolvedValue({ ...DETAIL, title: '' });

    await createMomentFromYoutubeLink(YOUTUBE_URL, ARTIST_CONTEXT);

    const call = vi.mocked(createMomentBatch).mock.calls[0][0];
    expect(call.contract.name).toBe('Untitled Video');
  });

  it('returns contractAddress, tokenId, hash, and chainId', async () => {
    const result = await createMomentFromYoutubeLink(
      YOUTUBE_URL,
      ARTIST_CONTEXT
    );

    expect(result).toEqual(MOMENT_RESULT);
  });

  it('mints to an existing collection when existingCollectionAddress is provided', async () => {
    const collection = '0x0000000000000000000000000000000000000002' as Address;

    await createMomentFromYoutubeLink(YOUTUBE_URL, ARTIST_CONTEXT, collection);

    const [input] = vi.mocked(createMomentBatch).mock.calls[0];
    expect(input.contract).toEqual({ address: getAddress(collection) });
    expect(input.tokens[0].tokenMetadataURI).toBe('ar://metadata-hash');
  });
});
