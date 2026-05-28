import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CHAIN_ID, IS_TESTNET } from '@/lib/consts';

vi.mock('@/lib/coinbase/getLegacySmartAccount', () => ({
  getLegacySmartAccount: vi.fn(),
}));
vi.mock('@/lib/viem/getWalletBalance', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/coinbase/sendUserOperation', () => ({
  sendUserOperation: vi.fn(),
}));
vi.mock('@/lib/smartwallets/getWithdrawalCall', () => ({
  getWithdrawalCall: vi.fn(),
}));

import { getLegacySmartAccount } from '@/lib/coinbase/getLegacySmartAccount';
import getWalletBalance from '@/lib/viem/getWalletBalance';
import { sendUserOperation } from '@/lib/coinbase/sendUserOperation';
import { getWithdrawalCall } from '@/lib/smartwallets/getWithdrawalCall';
import migrateSmartWalletFunds from '@/lib/artists/migrateSmartWalletFunds';

const legacyWalletAddress =
  '0xc345678901234567890123456789012345678901' as const;
const legacySmartAccountAddress =
  '0xb234567890123456789012345678901234567891' as const;
const canonicalAddr = '0xa123456789012345678901234567890123456789' as const;
const legacySmartAccount = { address: legacySmartAccountAddress } as any;

const expectedNetwork = IS_TESTNET ? 'base-sepolia' : 'base';

describe('migrateSmartWalletFunds', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getLegacySmartAccount).mockResolvedValue(legacySmartAccount);
    vi.mocked(getWithdrawalCall).mockImplementation(
      (currency, amount, to) => ({ mock: currency, amount, to }) as any
    );
    vi.mocked(sendUserOperation).mockResolvedValue({
      transactionHash: '0xtx',
    } as any);
  });

  it('skips when legacy smart account matches canonical', async () => {
    vi.mocked(getLegacySmartAccount).mockResolvedValue({
      address: canonicalAddr,
    } as any);

    await migrateSmartWalletFunds({
      legacyWalletAddress,
      canonicalSmartAccountAddress: canonicalAddr,
    });

    expect(getWalletBalance).not.toHaveBeenCalled();
    expect(sendUserOperation).not.toHaveBeenCalled();
  });

  it('does not send a user operation when ETH and USDC balances are zero', async () => {
    vi.mocked(getWalletBalance).mockResolvedValue({
      ethBalance: 0n,
      usdcBalance: 0n,
    });

    await migrateSmartWalletFunds({
      legacyWalletAddress,
      canonicalSmartAccountAddress: canonicalAddr,
    });

    expect(getLegacySmartAccount).toHaveBeenCalledWith({
      address: legacyWalletAddress,
    });
    expect(getWalletBalance).toHaveBeenCalledWith(
      legacySmartAccountAddress,
      CHAIN_ID
    );
    expect(sendUserOperation).not.toHaveBeenCalled();
    expect(getWithdrawalCall).not.toHaveBeenCalled();
  });

  it('withdraws ETH only and sends one user operation', async () => {
    const ethAmt = 1n;
    vi.mocked(getWalletBalance).mockResolvedValue({
      ethBalance: ethAmt,
      usdcBalance: 0n,
    });

    await migrateSmartWalletFunds({
      legacyWalletAddress,
      canonicalSmartAccountAddress: canonicalAddr,
    });

    expect(getWithdrawalCall).toHaveBeenCalledTimes(1);
    expect(getWithdrawalCall).toHaveBeenCalledWith(
      'eth',
      ethAmt,
      canonicalAddr,
      CHAIN_ID
    );
    expect(sendUserOperation).toHaveBeenCalledWith({
      smartAccount: legacySmartAccount,
      network: expectedNetwork,
      calls: [{ mock: 'eth', amount: ethAmt, to: canonicalAddr }],
    });
  });

  it('withdraws USDC only and sends one user operation', async () => {
    const usdcAmt = 5_000_000n;
    vi.mocked(getWalletBalance).mockResolvedValue({
      ethBalance: 0n,
      usdcBalance: usdcAmt,
    });

    await migrateSmartWalletFunds({
      legacyWalletAddress,
      canonicalSmartAccountAddress: canonicalAddr,
    });

    expect(getWithdrawalCall).toHaveBeenCalledTimes(1);
    expect(getWithdrawalCall).toHaveBeenCalledWith(
      'usdc',
      usdcAmt,
      canonicalAddr,
      CHAIN_ID
    );
    expect(sendUserOperation).toHaveBeenCalledWith({
      smartAccount: legacySmartAccount,
      network: expectedNetwork,
      calls: [{ mock: 'usdc', amount: usdcAmt, to: canonicalAddr }],
    });
  });

  it('batches ETH and USDC into a single user operation when both are non-zero', async () => {
    const ethAmt = 2n;
    const usdcAmt = 1n;
    vi.mocked(getWalletBalance).mockResolvedValue({
      ethBalance: ethAmt,
      usdcBalance: usdcAmt,
    });

    await migrateSmartWalletFunds({
      legacyWalletAddress,
      canonicalSmartAccountAddress: canonicalAddr,
    });

    expect(getWithdrawalCall).toHaveBeenNthCalledWith(
      1,
      'eth',
      ethAmt,
      canonicalAddr,
      CHAIN_ID
    );
    expect(getWithdrawalCall).toHaveBeenNthCalledWith(
      2,
      'usdc',
      usdcAmt,
      canonicalAddr,
      CHAIN_ID
    );
    expect(sendUserOperation).toHaveBeenCalledWith({
      smartAccount: legacySmartAccount,
      network: expectedNetwork,
      calls: [
        { mock: 'eth', amount: ethAmt, to: canonicalAddr },
        { mock: 'usdc', amount: usdcAmt, to: canonicalAddr },
      ],
    });
  });

  it('returns silently when balance fetch or send fails', async () => {
    vi.mocked(getWalletBalance).mockRejectedValue(new Error('rpc'));

    await expect(
      migrateSmartWalletFunds({
        legacyWalletAddress,
        canonicalSmartAccountAddress: canonicalAddr,
      })
    ).resolves.toBeUndefined();
  });
});
