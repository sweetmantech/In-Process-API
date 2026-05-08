import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/consts', () => ({
  CHAIN_ID: 8453,
  IS_TESTNET: false,
  PERMISSION_BIT_ADMIN: 2,
}));

vi.mock('@/lib/coinbase/getOrCreateSmartWallet', () => ({
  getOrCreateSmartWallet: vi.fn(),
}));

vi.mock('@/lib/zora/getPermission', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/coinbase/sendUserOperation', () => ({
  sendUserOperation: vi.fn(),
}));

import { getOrCreateSmartWallet } from '@/lib/coinbase/getOrCreateSmartWallet';
import getPermission from '@/lib/zora/getPermission';
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

const ADMIN = BigInt(2);
const NO_PERMISSION = BigInt(0);

const input = {
  artistAddress: ARTIST,
  recipients: [RECIPIENT],
  moment: { collectionAddress: COLLECTION, tokenId: '1', chainId: 8453 },
};

describe('airdropMoment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getOrCreateSmartWallet).mockResolvedValue({
      address: SMART_WALLET,
    } as any);
    vi.mocked(getPermission).mockResolvedValue(ADMIN);
    vi.mocked(sendUserOperation).mockResolvedValue({
      transactionHash: TX_HASH,
    } as any);
  });

  it('returns hash and chainId on success', async () => {
    const result = await airdropMoment(input);

    expect(result.hash).toBe(TX_HASH);
    expect(result.chainId).toBe(8453);
  });

  it('throws when smart wallet has no admin and artist has no admin', async () => {
    vi.mocked(getPermission).mockResolvedValue(NO_PERMISSION);

    await expect(airdropMoment(input)).rejects.toThrow(
      'The account does not have admin permission for this collection.'
    );
  });

  it('throws when smart wallet has no admin but artist has admin', async () => {
    vi.mocked(getPermission)
      .mockResolvedValueOnce(NO_PERMISSION)
      .mockResolvedValueOnce(ADMIN);

    await expect(airdropMoment(input)).rejects.toThrow(
      'Admin permission are not yet granted to smart wallet.'
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

  it('calls getOrCreateSmartWallet with artistAddress', async () => {
    await airdropMoment(input);

    expect(getOrCreateSmartWallet).toHaveBeenCalledWith({ address: ARTIST });
  });

  it('mints to each recipient using moment tokenId', async () => {
    const multipleRecipients = [RECIPIENT, SMART_WALLET];
    await airdropMoment({ ...input, recipients: multipleRecipients });

    const call = vi.mocked(sendUserOperation).mock.calls[0][0];
    expect(call.calls).toHaveLength(1);
    expect(call.calls[0].data).toBeDefined();
  });
});
