import { describe, it, expect } from 'vitest';
import getPrivySocialWalletFromLinkedAccounts from '@/lib/privy/getPrivySocialWalletFromLinkedAccounts';

describe('getPrivySocialWalletFromLinkedAccounts', () => {
  it('returns lowercase privy embedded wallet address', () => {
    const result = getPrivySocialWalletFromLinkedAccounts([
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
      getPrivySocialWalletFromLinkedAccounts([
        { type: 'email', address: 'user@example.com' } as any,
      ])
    ).toBeUndefined();
    expect(getPrivySocialWalletFromLinkedAccounts([])).toBeUndefined();
    expect(getPrivySocialWalletFromLinkedAccounts(undefined)).toBeUndefined();
  });
});
