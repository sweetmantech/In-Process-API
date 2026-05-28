import { describe, it, expect } from 'vitest';
import getExternalWalletsFromLinkedAccount from '@/lib/privy/getExternalWalletsFromLinkedAccount';

describe('getExternalWalletsFromLinkedAccount', () => {
  it('returns lowercase external wallet addresses', () => {
    expect(
      getExternalWalletsFromLinkedAccount([
        { type: 'email', address: 'user@example.com' },
        {
          type: 'wallet',
          wallet_client_type: 'privy',
          address: '0xPrivy',
        },
        {
          type: 'wallet',
          wallet_client_type: 'metamask',
          address: '0xExternal',
        },
        {
          type: 'wallet',
          wallet_client_type: 'coinbase_wallet',
          address: '0xOther',
        },
      ])
    ).toEqual(['0xexternal', '0xother']);
  });

  it('returns empty array when no external wallet exists', () => {
    expect(
      getExternalWalletsFromLinkedAccount([
        { type: 'email', address: 'user@example.com' },
        {
          type: 'wallet',
          wallet_client_type: 'privy',
          address: '0xPrivy',
        },
      ])
    ).toEqual([]);
    expect(getExternalWalletsFromLinkedAccount([])).toEqual([]);
    expect(getExternalWalletsFromLinkedAccount(undefined)).toEqual([]);
  });
});
