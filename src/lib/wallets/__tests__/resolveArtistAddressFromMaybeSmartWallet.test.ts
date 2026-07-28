import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Address } from 'viem';

vi.mock('@/lib/smartwallets/isCoinbaseSmartWallet', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/smartwallets/getSmartWalletOwnerAddresses', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/supabase/in_process_wallets/selectWallets', () => ({
  default: vi.fn(),
}));

import isCoinbaseSmartWallet from '@/lib/smartwallets/isCoinbaseSmartWallet';
import getSmartWalletOwnerAddresses from '@/lib/smartwallets/getSmartWalletOwnerAddresses';
import selectWallets from '@/lib/supabase/in_process_wallets/selectWallets';
import resolveArtistAddressFromMaybeSmartWallet from '../resolveArtistAddressFromMaybeSmartWallet';

const mockIsCb = vi.mocked(isCoinbaseSmartWallet);
const mockOwners = vi.mocked(getSmartWalletOwnerAddresses);
const mockSelectWallets = vi.mocked(selectWallets);

const SMART = '0x1111111111111111111111111111111111111111' as Address;
const EOA = '0x2222222222222222222222222222222222222222' as Address;

describe('resolveArtistAddressFromMaybeSmartWallet', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns lowercased address when not a Coinbase smart wallet', async () => {
    mockIsCb.mockResolvedValue(false);
    await expect(
      resolveArtistAddressFromMaybeSmartWallet({
        address: '0xAbCdEfAbCdEfAbCdEfAbCdEfAbCdEfAbCdEfAbCd' as Address,
        chainId: 8453,
      })
    ).resolves.toBe('0xabcdefabcdefabcdefabcdefabcdefabcdefabcd');
    expect(mockOwners).not.toHaveBeenCalled();
  });

  it('resolves Coinbase smart wallet to primary non-smart owner', async () => {
    mockIsCb.mockResolvedValue(true);
    mockOwners.mockResolvedValue([EOA]);
    mockSelectWallets.mockResolvedValue({
      data: [{ address: EOA.toLowerCase(), type: 'external' }],
    } as any);

    await expect(
      resolveArtistAddressFromMaybeSmartWallet({
        address: SMART,
        chainId: 8453,
      })
    ).resolves.toBe(EOA.toLowerCase());
  });

  it('falls back to smart wallet address when owners are not in DB', async () => {
    mockIsCb.mockResolvedValue(true);
    mockOwners.mockResolvedValue([EOA]);
    mockSelectWallets.mockResolvedValue({ data: [] } as any);

    await expect(
      resolveArtistAddressFromMaybeSmartWallet({
        address: SMART,
        chainId: 8453,
      })
    ).resolves.toBe(SMART.toLowerCase());
  });

  it('ignores type=smart wallet rows when picking primary', async () => {
    mockIsCb.mockResolvedValue(true);
    mockOwners.mockResolvedValue([EOA, SMART]);
    mockSelectWallets.mockResolvedValue({
      data: [
        { address: SMART.toLowerCase(), type: 'smart' },
        { address: EOA.toLowerCase(), type: 'privy' },
      ],
    } as any);

    await expect(
      resolveArtistAddressFromMaybeSmartWallet({
        address: SMART,
        chainId: 8453,
      })
    ).resolves.toBe(EOA.toLowerCase());
  });
});
