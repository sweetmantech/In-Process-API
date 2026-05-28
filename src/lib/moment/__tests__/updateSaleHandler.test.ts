import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/viem/getInProcessMomentInfo', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/smartwallets/getOperationalSmartWallet', () => ({
  getOperationalSmartWallet: vi.fn(),
}));

vi.mock('@/lib/coinbase/sendUserOperation', () => ({
  sendUserOperation: vi.fn(),
}));

vi.mock('@/lib/sales/getUpdateSaleCall', () => ({
  default: vi.fn(),
}));

import getMomentOnChainInfo from '@/lib/viem/getInProcessMomentInfo';
import { getOperationalSmartWallet } from '@/lib/smartwallets/getOperationalSmartWallet';
import { sendUserOperation } from '@/lib/coinbase/sendUserOperation';
import getUpdateSaleCall from '@/lib/sales/getUpdateSaleCall';
import updateSaleHandler from '@/lib/moment/updateSaleHandler';
import { MomentType } from '@/types/moment';

const COLLECTION = '0x0000000000000000000000000000000000000001' as const;
const CALLER = '0xcaller000000000000000000000000000000000' as const;
const TX_HASH =
  '0xtxhash000000000000000000000000000000000000000000000000000000000000';

const artist = {
  artistId: 'artist-uuid',
  primaryWallet: CALLER,
  wallets: [CALLER],
};

const moment = { collectionAddress: COLLECTION, tokenId: '1', chainId: 8453 };

const baseOnChainSale = {
  saleStart: BigInt(1000),
  saleEnd: BigInt(9999999),
  maxTokensPerAddress: BigInt(0),
  pricePerToken: BigInt(500),
  fundsRecipient: COLLECTION,
  type: MomentType.FixedPriceMint,
};

const mockCall = { to: COLLECTION, data: '0xencoded' };

describe('updateSaleHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getMomentOnChainInfo).mockResolvedValue({
      saleConfig: baseOnChainSale,
    } as any);
    vi.mocked(getOperationalSmartWallet).mockResolvedValue({
      address: CALLER,
    } as any);
    vi.mocked(sendUserOperation).mockResolvedValue({
      transactionHash: TX_HASH,
    } as any);
    vi.mocked(getUpdateSaleCall).mockReturnValue(mockCall as any);
  });

  it('returns 404 when saleConfig is null', async () => {
    vi.mocked(getMomentOnChainInfo).mockResolvedValue({
      saleConfig: null,
    } as any);

    const res = await updateSaleHandler({
      moment,
      artist,
      pricePerToken: '1000',
    });
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.message).toBe('Sale config not found');
  });

  it('overrides pricePerToken when provided', async () => {
    await updateSaleHandler({
      moment,
      artist,
      pricePerToken: '9999',
    });

    expect(getUpdateSaleCall).toHaveBeenCalledWith(
      moment,
      MomentType.FixedPriceMint,
      expect.objectContaining({ pricePerToken: BigInt('9999') })
    );
  });

  it('keeps existing pricePerToken when not provided', async () => {
    await updateSaleHandler({
      moment,
      artist,
      saleStart: 1748736000,
    });

    expect(getUpdateSaleCall).toHaveBeenCalledWith(
      moment,
      MomentType.FixedPriceMint,
      expect.objectContaining({ pricePerToken: BigInt(500) })
    );
  });

  it('overrides saleStart when provided', async () => {
    await updateSaleHandler({
      moment,
      artist,
      saleStart: 1748736000,
    });

    expect(getUpdateSaleCall).toHaveBeenCalledWith(
      moment,
      MomentType.FixedPriceMint,
      expect.objectContaining({ saleStart: BigInt(1748736000) })
    );
  });

  it('keeps existing saleStart when not provided', async () => {
    await updateSaleHandler({
      moment,
      artist,
      pricePerToken: '1000',
    });

    expect(getUpdateSaleCall).toHaveBeenCalledWith(
      moment,
      MomentType.FixedPriceMint,
      expect.objectContaining({ saleStart: BigInt(1000) })
    );
  });

  it('passes Erc20Mint type to getUpdateSaleCall', async () => {
    vi.mocked(getMomentOnChainInfo).mockResolvedValue({
      saleConfig: {
        ...baseOnChainSale,
        type: MomentType.Erc20Mint,
        currency: COLLECTION,
      },
    } as any);

    await updateSaleHandler({
      moment,
      artist,
      pricePerToken: '1000',
    });

    expect(getUpdateSaleCall).toHaveBeenCalledWith(
      moment,
      MomentType.Erc20Mint,
      expect.any(Object)
    );
  });

  it('uses base-sepolia network for baseSepolia chainId', async () => {
    const sepoliaMoment = { ...moment, chainId: 84532 };

    await updateSaleHandler({
      moment: sepoliaMoment,
      artist,
      pricePerToken: '1000',
    });

    expect(sendUserOperation).toHaveBeenCalledWith(
      expect.objectContaining({ network: 'base-sepolia' })
    );
  });

  it('uses base network for mainnet chainId', async () => {
    await updateSaleHandler({
      moment,
      artist,
      pricePerToken: '1000',
    });

    expect(sendUserOperation).toHaveBeenCalledWith(
      expect.objectContaining({ network: 'base' })
    );
  });

  it('returns hash and chainId on success', async () => {
    const res = await updateSaleHandler({
      moment,
      artist,
      pricePerToken: '1000',
    });
    const json = await res.json();

    expect(json.hash).toBe(TX_HASH);
    expect(json.chainId).toBe(8453);
  });

  it('overrides saleEnd when provided', async () => {
    await updateSaleHandler({
      moment,
      artist,
      saleEnd: 1780272000,
    });

    expect(getUpdateSaleCall).toHaveBeenCalledWith(
      moment,
      MomentType.FixedPriceMint,
      expect.objectContaining({ saleEnd: BigInt(1780272000) })
    );
  });

  it('keeps existing saleEnd when not provided', async () => {
    await updateSaleHandler({
      moment,
      artist,
      pricePerToken: '1000',
    });

    expect(getUpdateSaleCall).toHaveBeenCalledWith(
      moment,
      MomentType.FixedPriceMint,
      expect.objectContaining({ saleEnd: BigInt(9999999) })
    );
  });

  it('overrides maxTokensPerAddress when provided', async () => {
    await updateSaleHandler({
      moment,
      artist,
      maxTokensPerAddress: 10,
    });

    expect(getUpdateSaleCall).toHaveBeenCalledWith(
      moment,
      MomentType.FixedPriceMint,
      expect.objectContaining({ maxTokensPerAddress: BigInt(10) })
    );
  });

  it('overrides fundsRecipient when provided', async () => {
    const newRecipient = '0x000000000000000000000000000000000000beef';

    await updateSaleHandler({
      moment,
      artist,
      fundsRecipient: newRecipient,
    });

    expect(getUpdateSaleCall).toHaveBeenCalledWith(
      moment,
      MomentType.FixedPriceMint,
      expect.objectContaining({ fundsRecipient: newRecipient })
    );
  });

  it('throws when sendUserOperation rejects', async () => {
    vi.mocked(sendUserOperation).mockRejectedValue(
      new Error('Paymaster failed')
    );

    await expect(
      updateSaleHandler({
        moment,
        artist,
        pricePerToken: '1000',
      })
    ).rejects.toThrow('Paymaster failed');
  });
});
