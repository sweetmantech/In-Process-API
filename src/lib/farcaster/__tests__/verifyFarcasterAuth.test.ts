import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('viem/siwe', () => ({
  parseSiweMessage: vi.fn(),
}));

vi.mock('viem', () => ({
  recoverMessageAddress: vi.fn(),
}));

vi.mock('@/lib/consts', () => ({
  CHAIN_ID: 8453,
}));

import { parseSiweMessage } from 'viem/siwe';
import { recoverMessageAddress } from 'viem';
import { verifyFarcasterAuth } from '@/lib/farcaster/verifyFarcasterAuth';

const address = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266';
const message = 'test message';
const signature = '0xsig';
const CHAIN_ID = 8453;

describe('verifyFarcasterAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns lowercase address on valid message and signature', async () => {
    vi.mocked(parseSiweMessage).mockReturnValue({
      chainId: CHAIN_ID,
      address,
    } as any);
    vi.mocked(recoverMessageAddress).mockResolvedValue(address as any);

    const result = await verifyFarcasterAuth(message, signature);
    expect(result).toBe(address.toLowerCase());
  });

  it('throws when chainId does not match expected chain', async () => {
    vi.mocked(parseSiweMessage).mockReturnValue({
      chainId: 1,
      address,
    } as any);

    await expect(verifyFarcasterAuth(message, signature)).rejects.toThrow(
      'Invalid chainId'
    );
  });

  it('throws when chainId is missing', async () => {
    vi.mocked(parseSiweMessage).mockReturnValue({
      chainId: undefined,
      address,
    } as any);

    await expect(verifyFarcasterAuth(message, signature)).rejects.toThrow(
      'Invalid chainId'
    );
  });

  it('throws when recovered address does not match parsed address', async () => {
    const different = '0x70997970c51812dc3a010c7d01b50e0d17dc79c8';
    vi.mocked(parseSiweMessage).mockReturnValue({
      chainId: CHAIN_ID,
      address,
    } as any);
    vi.mocked(recoverMessageAddress).mockResolvedValue(different as any);

    await expect(verifyFarcasterAuth(message, signature)).rejects.toThrow(
      'Invalid signature'
    );
  });

  it('normalizes address comparison to lowercase', async () => {
    const upperAddress = address.toUpperCase() as `0x${string}`;
    vi.mocked(parseSiweMessage).mockReturnValue({
      chainId: CHAIN_ID,
      address: upperAddress,
    } as any);
    vi.mocked(recoverMessageAddress).mockResolvedValue(address as any);

    const result = await verifyFarcasterAuth(message, signature);
    expect(result).toBe(address.toLowerCase());
  });
});
