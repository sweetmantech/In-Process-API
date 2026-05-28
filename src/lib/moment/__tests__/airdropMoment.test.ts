import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/consts', () => ({
  CHAIN_ID: 8453,
  IS_TESTNET: false,
}));

vi.mock('@/lib/smartwallets/getOperationalSmartWallet', () => ({
  getOperationalSmartWallet: vi.fn(),
}));

vi.mock('@/lib/coinbase/sendUserOperation', () => ({
  sendUserOperation: vi.fn(),
}));

import { getOperationalSmartWallet } from '@/lib/smartwallets/getOperationalSmartWallet';
import { sendUserOperation } from '@/lib/coinbase/sendUserOperation';
import { airdropMoment } from '@/lib/moment/airdropMoment';

const ARTIST = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266' as `0x${string}`;
const SMART_WALLET =
  '0x70997970c51812dc3a010c7d01b50e0d17dc79c8' as `0x${string}`;
const RECIPIENT = '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc' as `0x${string}`;
const COLLECTION =
  '0x0000000000000000000000000000000000000001' as `0x${string}`;
const TX_HASH =
  '0xtxhash000000000000000000000000000000000000000000000000000000000000' as `0x${string}`;

const artist = {
  artistId: 'artist-uuid',
  primaryWallet: ARTIST,
  wallets: [ARTIST],
};

const moment = { collectionAddress: COLLECTION, tokenId: '1', chainId: 8453 };

const input = {
  artist,
  recipients: [RECIPIENT],
  moment,
};

describe('airdropMoment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getOperationalSmartWallet).mockResolvedValue({
      address: SMART_WALLET,
    } as any);
    vi.mocked(sendUserOperation).mockResolvedValue({
      transactionHash: TX_HASH,
    } as any);
  });

  it('returns hash and chainId on success', async () => {
    const result = await airdropMoment(input);

    expect(result.hash).toBe(TX_HASH);
    expect(result.chainId).toBe(8453);
  });

  it('propagates when getOperationalSmartWallet rejects', async () => {
    vi.mocked(getOperationalSmartWallet).mockRejectedValue(
      new Error('No authorized smart wallet found')
    );

    await expect(airdropMoment(input)).rejects.toThrow(
      'No authorized smart wallet found'
    );
  });

  it('calls sendUserOperation targeting the collection address', async () => {
    await airdropMoment(input);

    expect(sendUserOperation).toHaveBeenCalledWith(
      expect.objectContaining({
        calls: expect.arrayContaining([
          expect.objectContaining({ to: COLLECTION }),
        ]),
      })
    );
  });

  it('uses base network when IS_TESTNET is false', async () => {
    await airdropMoment(input);

    expect(sendUserOperation).toHaveBeenCalledWith(
      expect.objectContaining({ network: 'base' })
    );
  });

  it('calls getOperationalSmartWallet with artist and moment', async () => {
    await airdropMoment(input);

    expect(getOperationalSmartWallet).toHaveBeenCalledWith({ artist, moment });
  });

  it('mints to each recipient using moment tokenId', async () => {
    const multipleRecipients = [RECIPIENT, SMART_WALLET];
    await airdropMoment({ ...input, recipients: multipleRecipients });

    const call = vi.mocked(sendUserOperation).mock.calls[0][0];
    expect(call.calls).toHaveLength(1);
    expect(call.calls[0].data).toBeDefined();
  });
});
