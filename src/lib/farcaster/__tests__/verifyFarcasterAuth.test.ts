import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('viem/siwe', () => ({
  parseSiweMessage: vi.fn(),
}));

vi.mock('viem', () => ({
  recoverMessageAddress: vi.fn(),
}));

vi.mock('@/lib/farcaster/getValidNonces', () => ({
  getValidNonces: vi.fn(),
}));

import { parseSiweMessage } from 'viem/siwe';
import { recoverMessageAddress } from 'viem';
import { getValidNonces } from '@/lib/farcaster/getValidNonces';
import { verifyFarcasterAuth } from '@/lib/farcaster/verifyFarcasterAuth';

const address = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266';
const message = 'test message';
const signature = '0xsig';
const validNonce = '12345';

describe('verifyFarcasterAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getValidNonces).mockReturnValue([validNonce, '12344']);
  });

  it('returns lowercase address on valid message and signature', async () => {
    vi.mocked(parseSiweMessage).mockReturnValue({
      nonce: validNonce,
      address,
    } as any);
    vi.mocked(recoverMessageAddress).mockResolvedValue(address as any);

    const result = await verifyFarcasterAuth(message, signature);
    expect(result).toBe(address.toLowerCase());
  });

  it('throws when nonce is missing', async () => {
    vi.mocked(parseSiweMessage).mockReturnValue({
      nonce: undefined,
      address,
    } as any);

    await expect(verifyFarcasterAuth(message, signature)).rejects.toThrow(
      'Expired nonce'
    );
  });

  it('throws when nonce is not in the valid window', async () => {
    vi.mocked(parseSiweMessage).mockReturnValue({
      nonce: '99999',
      address,
    } as any);

    await expect(verifyFarcasterAuth(message, signature)).rejects.toThrow(
      'Expired nonce'
    );
  });

  it('accepts nonce from the previous window', async () => {
    vi.mocked(parseSiweMessage).mockReturnValue({
      nonce: '12344',
      address,
    } as any);
    vi.mocked(recoverMessageAddress).mockResolvedValue(address as any);

    const result = await verifyFarcasterAuth(message, signature);
    expect(result).toBe(address.toLowerCase());
  });

  it('throws when recovered address does not match parsed address', async () => {
    const different = '0x70997970c51812dc3a010c7d01b50e0d17dc79c8';
    vi.mocked(parseSiweMessage).mockReturnValue({
      nonce: validNonce,
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
      nonce: validNonce,
      address: upperAddress,
    } as any);
    vi.mocked(recoverMessageAddress).mockResolvedValue(address as any);

    const result = await verifyFarcasterAuth(message, signature);
    expect(result).toBe(address.toLowerCase());
  });
});
