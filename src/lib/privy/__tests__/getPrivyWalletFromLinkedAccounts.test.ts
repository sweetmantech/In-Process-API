import { describe, it, expect } from 'vitest';
import getPrivyWalletFromLinkedAccounts from '@/lib/privy/getPrivyWalletFromLinkedAccounts';

describe('getPrivyWalletFromLinkedAccounts', () => {
  it('returns lowercase privy embedded wallet address', () => {
    const result = getPrivyWalletFromLinkedAccounts([
      { type: 'email', address: 'user@example.com' } as any,
      {
        type: 'wallet',
        wallet_client_type: 'privy',
        address: '0xABC',
      } as any,
    ]);

    expect(result).toBe('0xabc');
  });

  it('returns undefined when no privy wallet exists', () => {
    expect(
      getPrivyWalletFromLinkedAccounts([
        { type: 'email', address: 'user@example.com' } as any,
      ])
    ).toBeUndefined();
    expect(getPrivyWalletFromLinkedAccounts([])).toBeUndefined();
    expect(getPrivyWalletFromLinkedAccounts(undefined)).toBeUndefined();
  });
});
