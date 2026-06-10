import { describe, it, expect } from 'vitest';
import { mainnet, sepolia } from 'viem/chains';
import { getNounsGovernorAddress } from '../getNounsGovernorAddress';

describe('getNounsGovernorAddress', () => {
  it('returns mainnet governor address', () => {
    const address = getNounsGovernorAddress(mainnet.id);
    expect(address).toBe('0x6f3e6272a167e8accb32072d08e0957f9c79223d');
  });

  it('returns sepolia governor address', () => {
    const address = getNounsGovernorAddress(sepolia.id);
    expect(address).toBe('0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57');
  });

  it('returns a checksummed hex address', () => {
    const address = getNounsGovernorAddress(mainnet.id);
    expect(address).toMatch(/^0x[0-9a-fA-F]{40}$/);
  });

  it('throws for an unsupported chainId', () => {
    expect(() => getNounsGovernorAddress(8453)).toThrow(
      'No Nouns Governor address for chainId 8453'
    );
  });

  it('throws for an unknown chainId', () => {
    expect(() => getNounsGovernorAddress(9999)).toThrow();
  });
});
