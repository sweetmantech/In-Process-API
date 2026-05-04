import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CHAIN_ID, IS_TESTNET } from '@/lib/consts';

vi.mock('@/lib/smartwallets/getSmartWalletsBalances', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/coinbase/sendUserOperation', () => ({
  sendUserOperation: vi.fn(),
}));
vi.mock('@/lib/smartwallets/getWithdrawalCall', () => ({
  getWithdrawalCall: vi.fn(),
}));

import getSmartWalletsBalances from '@/lib/smartwallets/getSmartWalletsBalances';
import { sendUserOperation } from '@/lib/coinbase/sendUserOperation';
import { getWithdrawalCall } from '@/lib/smartwallets/getWithdrawalCall';
import migrateSmartWalletFunds from '@/lib/artists/migrateSmartWalletFunds';

const socialAddr = '0xb234567890123456789012345678901234567891' as const;
const artistAddr = '0xa123456789012345678901234567890123456789' as const;
const socialSmartAccount = { address: socialAddr } as any;

const expectedNetwork = IS_TESTNET ? 'base-sepolia' : 'base';

describe('migrateSmartWalletFunds', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getWithdrawalCall).mockImplementation(
      (currency, amount, to) => ({ mock: currency, amount, to }) as any
    );
    vi.mocked(sendUserOperation).mockResolvedValue({
      transactionHash: '0xtx',
    } as any);
  });

  it('does not send a user operation when balance map has no entry for the social wallet', async () => {
    vi.mocked(getSmartWalletsBalances).mockResolvedValue({
      totalEthBalance: 0n,
      totalUsdcBalance: 0n,
      walletsBalances: new Map(),
    });

    await migrateSmartWalletFunds({
      socialSmartAccount,
      artistSmartWalletAddress: artistAddr,
    });

    expect(getSmartWalletsBalances).toHaveBeenCalledWith(
      [
        {
          address: socialAddr,
          smartWallet: socialSmartAccount,
        },
      ],
      CHAIN_ID
    );
    expect(sendUserOperation).not.toHaveBeenCalled();
    expect(getWithdrawalCall).not.toHaveBeenCalled();
  });

  it('does not send a user operation when ETH and USDC balances are zero', async () => {
    const map = new Map();
    map.set(socialAddr, {
      ethBalance: 0n,
      usdcBalance: 0n,
      smartAccount: socialSmartAccount,
      address: socialAddr,
    });
    vi.mocked(getSmartWalletsBalances).mockResolvedValue({
      totalEthBalance: 0n,
      totalUsdcBalance: 0n,
      walletsBalances: map,
    });

    await migrateSmartWalletFunds({
      socialSmartAccount,
      artistSmartWalletAddress: artistAddr,
    });

    expect(sendUserOperation).not.toHaveBeenCalled();
    expect(getWithdrawalCall).not.toHaveBeenCalled();
  });

  it('withdraws ETH only and sends one user operation', async () => {
    const ethAmt = 1n;
    const map = new Map();
    map.set(socialAddr, {
      ethBalance: ethAmt,
      usdcBalance: 0n,
      smartAccount: socialSmartAccount,
      address: socialAddr,
    });
    vi.mocked(getSmartWalletsBalances).mockResolvedValue({
      totalEthBalance: ethAmt,
      totalUsdcBalance: 0n,
      walletsBalances: map,
    });

    await migrateSmartWalletFunds({
      socialSmartAccount,
      artistSmartWalletAddress: artistAddr,
    });

    expect(getWithdrawalCall).toHaveBeenCalledTimes(1);
    expect(getWithdrawalCall).toHaveBeenCalledWith(
      'eth',
      ethAmt,
      artistAddr,
      CHAIN_ID
    );
    expect(sendUserOperation).toHaveBeenCalledWith({
      smartAccount: socialSmartAccount,
      network: expectedNetwork,
      calls: [{ mock: 'eth', amount: ethAmt, to: artistAddr }],
    });
  });

  it('withdraws USDC only and sends one user operation', async () => {
    const usdcAmt = 5_000_000n;
    const map = new Map();
    map.set(socialAddr, {
      ethBalance: 0n,
      usdcBalance: usdcAmt,
      smartAccount: socialSmartAccount,
      address: socialAddr,
    });
    vi.mocked(getSmartWalletsBalances).mockResolvedValue({
      totalEthBalance: 0n,
      totalUsdcBalance: usdcAmt,
      walletsBalances: map,
    });

    await migrateSmartWalletFunds({
      socialSmartAccount,
      artistSmartWalletAddress: artistAddr,
    });

    expect(getWithdrawalCall).toHaveBeenCalledTimes(1);
    expect(getWithdrawalCall).toHaveBeenCalledWith(
      'usdc',
      usdcAmt,
      artistAddr,
      CHAIN_ID
    );
    expect(sendUserOperation).toHaveBeenCalledWith({
      smartAccount: socialSmartAccount,
      network: expectedNetwork,
      calls: [{ mock: 'usdc', amount: usdcAmt, to: artistAddr }],
    });
  });

  it('batches ETH and USDC into a single user operation when both are non-zero', async () => {
    const ethAmt = 2n;
    const usdcAmt = 1n;
    const map = new Map();
    map.set(socialAddr, {
      ethBalance: ethAmt,
      usdcBalance: usdcAmt,
      smartAccount: socialSmartAccount,
      address: socialAddr,
    });
    vi.mocked(getSmartWalletsBalances).mockResolvedValue({
      totalEthBalance: ethAmt,
      totalUsdcBalance: usdcAmt,
      walletsBalances: map,
    });

    await migrateSmartWalletFunds({
      socialSmartAccount,
      artistSmartWalletAddress: artistAddr,
    });

    expect(getWithdrawalCall).toHaveBeenNthCalledWith(
      1,
      'eth',
      ethAmt,
      artistAddr,
      CHAIN_ID
    );
    expect(getWithdrawalCall).toHaveBeenNthCalledWith(
      2,
      'usdc',
      usdcAmt,
      artistAddr,
      CHAIN_ID
    );
    expect(sendUserOperation).toHaveBeenCalledWith({
      smartAccount: socialSmartAccount,
      network: expectedNetwork,
      calls: [
        { mock: 'eth', amount: ethAmt, to: artistAddr },
        { mock: 'usdc', amount: usdcAmt, to: artistAddr },
      ],
    });
  });

  it('wraps errors from balance fetch or send', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(getSmartWalletsBalances).mockRejectedValue(new Error('rpc'));

    await expect(
      migrateSmartWalletFunds({
        socialSmartAccount,
        artistSmartWalletAddress: artistAddr,
      })
    ).rejects.toThrow(/❌ migrateSmartWalletFunds:/);

    errSpy.mockRestore();
  });
});
