import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAddress, type Address } from 'viem';
import createMomentFromText from '@/lib/telegram/chat/moment/createMomentFromText';

vi.mock('@/lib/writing/uploadWritingWithJson', () => ({
  uploadWritingWithJson: vi.fn(),
}));
vi.mock('@/lib/moment/createMomentBatch', () => ({ default: vi.fn() }));
vi.mock('@/lib/consts', () => ({
  CHAIN_ID: 8453,
  REFERRAL_RECIPIENT: '0x1111111111111111111111111111111111111111',
  USDC_ADDRESS: {
    8453: '0x2222222222222222222222222222222222222222',
  },
  IS_TESTNET: false,
}));

import { uploadWritingWithJson } from '@/lib/writing/uploadWritingWithJson';
import createMomentBatch from '@/lib/moment/createMomentBatch';

const ARTIST_ADDRESS = '0x0000000000000000000000000000000000000123' as Address;
const ARTIST_CONTEXT = {
  artistId: 'artist-uuid-123',
  primaryWallet: ARTIST_ADDRESS,
  wallets: [{ address: ARTIST_ADDRESS, type: 'external' as const }],
};
const CONTENT = 'Hello from Telegram\nSecond line';
const METADATA_URI = 'https://example.com/writing.json';

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(uploadWritingWithJson).mockResolvedValue(METADATA_URI);
  vi.mocked(createMomentBatch).mockResolvedValue({
    contractAddress: '0xContract' as Address,
    tokenIds: ['1'],
    hash: '0x1111111111111111111111111111111111111111111111111111111111111111',
    chainId: 8453,
  } as never);
});

describe('createMomentFromText', () => {
  it('uploads writing metadata and mints a telegram-channel batch', async () => {
    await createMomentFromText(CONTENT, ARTIST_CONTEXT);

    expect(uploadWritingWithJson).toHaveBeenCalledWith(
      'Hello from Telegram',
      CONTENT,
      getAddress(ARTIST_ADDRESS)
    );
    expect(createMomentBatch).toHaveBeenCalledWith(
      expect.objectContaining({
        contract: { name: 'Hello from Telegram', uri: METADATA_URI },
        tokens: [
          expect.objectContaining({
            tokenMetadataURI: METADATA_URI,
            payoutRecipient: getAddress(ARTIST_ADDRESS),
          }),
        ],
        account: getAddress(ARTIST_ADDRESS),
        channel: 'telegram',
      })
    );
  });

  it('mints into an existing collection when provided', async () => {
    const collection = '0x0000000000000000000000000000000000000abc' as Address;

    await createMomentFromText(CONTENT, ARTIST_CONTEXT, collection);

    expect(createMomentBatch).toHaveBeenCalledWith(
      expect.objectContaining({
        contract: { address: getAddress(collection).toLowerCase() },
      })
    );
  });
});
