import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('viem/siwe', () => ({
  parseSiweMessage: vi.fn(),
}));

vi.mock('viem', () => ({
  recoverMessageAddress: vi.fn(),
}));

vi.mock('@/lib/farcaster/isAuthorizedSigner', () => ({
  default: vi.fn(),
}));

import { parseSiweMessage } from 'viem/siwe';
import { recoverMessageAddress } from 'viem';
import isAuthorizedSigner from '@/lib/farcaster/isAuthorizedSigner';
import verifyFarcasterAuth from '@/lib/farcaster/verifyFarcasterAuth';

const custodyAddress = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266';
const signerAddress = '0x70997970c51812dc3a010c7d01b50e0d17dc79c8';
const message = 'test message';
const signature = '0xsig';
const CHAIN_ID = 10; // Optimism (Farcaster SIWE chain)
const FID = '12345';

describe('verifyFarcasterAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns verified address when signer is the custody address', async () => {
    vi.mocked(parseSiweMessage).mockReturnValue({
      chainId: CHAIN_ID,
      address: custodyAddress,
      resources: [`farcaster://fid/${FID}`],
    } as any);
    vi.mocked(recoverMessageAddress).mockResolvedValue(custodyAddress as any);
    vi.mocked(isAuthorizedSigner).mockResolvedValue({
      authorized: true,
      verifiedAddress: signerAddress,
    });

    const result = await verifyFarcasterAuth(message, signature);
    expect(result).toBe(signerAddress);
  });

  it('returns verified address when signer is a verified address', async () => {
    vi.mocked(parseSiweMessage).mockReturnValue({
      chainId: CHAIN_ID,
      address: signerAddress,
      resources: [`farcaster://fid/${FID}`],
    } as any);
    vi.mocked(recoverMessageAddress).mockResolvedValue(signerAddress as any);
    vi.mocked(isAuthorizedSigner).mockResolvedValue({
      authorized: true,
      verifiedAddress: signerAddress,
    });

    const result = await verifyFarcasterAuth(message, signature);
    expect(result).toBe(signerAddress);
  });

  it('throws when chainId does not match expected chain', async () => {
    vi.mocked(parseSiweMessage).mockReturnValue({
      chainId: 1,
      address: custodyAddress,
    } as any);

    await expect(verifyFarcasterAuth(message, signature)).rejects.toThrow(
      'Invalid chainId'
    );
  });

  it('throws when chainId is missing', async () => {
    vi.mocked(parseSiweMessage).mockReturnValue({
      chainId: undefined,
      address: custodyAddress,
    } as any);

    await expect(verifyFarcasterAuth(message, signature)).rejects.toThrow(
      'Invalid chainId'
    );
  });

  it('throws when recovered address does not match parsed address', async () => {
    vi.mocked(parseSiweMessage).mockReturnValue({
      chainId: CHAIN_ID,
      address: custodyAddress,
      resources: [`farcaster://fid/${FID}`],
    } as any);
    vi.mocked(recoverMessageAddress).mockResolvedValue(signerAddress as any);

    await expect(verifyFarcasterAuth(message, signature)).rejects.toThrow(
      'Invalid signature'
    );
  });

  it('throws when SIWE message has no FID resource', async () => {
    vi.mocked(parseSiweMessage).mockReturnValue({
      chainId: CHAIN_ID,
      address: custodyAddress,
      resources: [],
    } as any);
    vi.mocked(recoverMessageAddress).mockResolvedValue(custodyAddress as any);

    await expect(verifyFarcasterAuth(message, signature)).rejects.toThrow(
      'No FID found in SIWE message'
    );
  });

  it('throws when signer is not authorized for the FID', async () => {
    const unauthorizedSigner = '0x1234567890123456789012345678901234567890';
    vi.mocked(parseSiweMessage).mockReturnValue({
      chainId: CHAIN_ID,
      address: unauthorizedSigner,
      resources: [`farcaster://fid/${FID}`],
    } as any);
    vi.mocked(recoverMessageAddress).mockResolvedValue(
      unauthorizedSigner as any
    );
    vi.mocked(isAuthorizedSigner).mockResolvedValue({
      authorized: false,
      verifiedAddress: signerAddress,
    });

    await expect(verifyFarcasterAuth(message, signature)).rejects.toThrow(
      'Signer not authorized for FID'
    );
  });
});
