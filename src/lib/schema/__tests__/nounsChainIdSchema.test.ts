import { describe, it, expect } from 'vitest';
import { mainnet, sepolia } from 'viem/chains';
import nounsChainIdSchema, { NOUNS_CHAIN_IDS } from '../nounsChainIdSchema';

describe('nounsChainIdSchema', () => {
  it('accepts mainnet chainId', () => {
    const result = nounsChainIdSchema.safeParse(mainnet.id);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe(mainnet.id);
  });

  it('accepts sepolia chainId', () => {
    const result = nounsChainIdSchema.safeParse(sepolia.id);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe(sepolia.id);
  });

  it('defaults to mainnet when undefined', () => {
    const result = nounsChainIdSchema.safeParse(undefined);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe(mainnet.id);
  });

  it('coerces string mainnet id to number', () => {
    const result = nounsChainIdSchema.safeParse(String(mainnet.id));
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe(mainnet.id);
  });

  it('rejects Base chainId', () => {
    const result = nounsChainIdSchema.safeParse(8453);
    expect(result.success).toBe(false);
  });

  it('rejects Base Sepolia chainId', () => {
    const result = nounsChainIdSchema.safeParse(84532);
    expect(result.success).toBe(false);
  });

  it('rejects non-numeric string', () => {
    const result = nounsChainIdSchema.safeParse('mainnet');
    expect(result.success).toBe(false);
  });

  it('NOUNS_CHAIN_IDS contains exactly mainnet and sepolia', () => {
    expect(NOUNS_CHAIN_IDS).toContain(mainnet.id);
    expect(NOUNS_CHAIN_IDS).toContain(sepolia.id);
    expect(NOUNS_CHAIN_IDS).toHaveLength(2);
  });
});
