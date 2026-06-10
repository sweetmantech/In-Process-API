import { describe, it, expect, vi } from 'vitest';
import { mainnet, sepolia } from 'viem/chains';

vi.mock('@/lib/viem/publicClient', () => ({
  getPublicClient: vi.fn(),
}));

import { getPublicClient } from '@/lib/viem/publicClient';
import { getNounsProposalThreshold } from '../getNounsProposalThreshold';

const mockReadContract = (returnValue: bigint) => {
  vi.mocked(getPublicClient).mockReturnValue({
    readContract: vi.fn().mockResolvedValue(returnValue),
  } as any);
};

describe('getNounsProposalThreshold', () => {
  it('calls getPublicClient with the given chainId', async () => {
    mockReadContract(BigInt(1));
    await getNounsProposalThreshold(mainnet.id);
    expect(getPublicClient).toHaveBeenCalledWith(mainnet.id);
  });

  it('reads proposalThreshold from the mainnet governor', async () => {
    const mockRead = vi.fn().mockResolvedValue(BigInt(1));
    vi.mocked(getPublicClient).mockReturnValue({
      readContract: mockRead,
    } as any);

    await getNounsProposalThreshold(mainnet.id);

    expect(mockRead).toHaveBeenCalledWith(
      expect.objectContaining({
        address: '0x6f3e6272a167e8accb32072d08e0957f9c79223d',
        functionName: 'proposalThreshold',
      })
    );
  });

  it('reads proposalThreshold from the sepolia governor', async () => {
    const mockRead = vi.fn().mockResolvedValue(BigInt(1));
    vi.mocked(getPublicClient).mockReturnValue({
      readContract: mockRead,
    } as any);

    await getNounsProposalThreshold(sepolia.id);

    expect(mockRead).toHaveBeenCalledWith(
      expect.objectContaining({
        address: '0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57',
        functionName: 'proposalThreshold',
      })
    );
  });

  it('returns threshold as a number', async () => {
    mockReadContract(BigInt(2));
    const result = await getNounsProposalThreshold(mainnet.id);
    expect(result).toBe(2);
    expect(typeof result).toBe('number');
  });

  it('returns 0 when threshold is zero', async () => {
    mockReadContract(BigInt(0));
    const result = await getNounsProposalThreshold(mainnet.id);
    expect(result).toBe(0);
  });

  it('throws for an unsupported chainId', async () => {
    await expect(getNounsProposalThreshold(8453)).rejects.toThrow(
      'No Nouns Governor address for chainId 8453'
    );
  });
});
