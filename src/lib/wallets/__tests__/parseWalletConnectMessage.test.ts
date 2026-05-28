import { describe, it, expect } from 'vitest';
import { getAddress } from 'viem';
import parseWalletConnectMessage from '@/lib/wallets/parseWalletConnectMessage';

const ADDRESS = getAddress('0xa123456789012345678901234567890123456789');

describe('parseWalletConnectMessage', () => {
  it('parses address and client-type', () => {
    expect(
      parseWalletConnectMessage(`${ADDRESS}\nclient-type:farcaster`)
    ).toEqual({
      address: ADDRESS,
      clientType: 'farcaster',
    });
  });

  it('throws when client-type is invalid', () => {
    expect(() =>
      parseWalletConnectMessage(`${ADDRESS}\nclient-type:unknown`)
    ).toThrow('Invalid client-type in message');
  });

  it('throws when format has extra lines', () => {
    expect(() =>
      parseWalletConnectMessage(`${ADDRESS}\nclient-type:external\nextra`)
    ).toThrow('Invalid wallet connect message format');
  });
});
