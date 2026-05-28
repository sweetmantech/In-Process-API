import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Address } from 'viem';
import {
  createMomentBatchSchema,
  createMomentSchema,
} from '@/lib/schema/createMomentSchema';
import {
  simulateCreateMoment,
  simulateCreateMomentBatch,
} from '../simulateCreateMoment';

vi.mock('@/lib/coinbase/getWalletLinkedSmartAccount', () => ({
  getWalletLinkedSmartAccount: vi.fn(),
}));
vi.mock('../createBatchSetupActions', () => ({ default: vi.fn() }));
vi.mock('@/lib/viem/createMomentBatchCall', () => ({ default: vi.fn() }));
vi.mock('@/lib/viem/publicClient', () => ({
  publicClient: { call: vi.fn() },
}));
vi.mock('@/lib/coinbase/prepareUserOperation', () => ({
  prepareUserOperation: vi.fn(),
}));
vi.mock('@/lib/consts', () => ({
  CHAIN_ID: 8453,
}));

import { getWalletLinkedSmartAccount } from '@/lib/coinbase/getWalletLinkedSmartAccount';
import createBatchSetupActions from '../createBatchSetupActions';
import createMomentBatchCall from '@/lib/viem/createMomentBatchCall';
import { publicClient } from '@/lib/viem/publicClient';
import { prepareUserOperation } from '@/lib/coinbase/prepareUserOperation';

const ARTIST =
  '0x0000000000000000000000000000000000000123'.toLowerCase() as Address;
const REF =
  '0x1111111111111111111111111111111111111111'.toLowerCase() as Address;
const USDC =
  '0x2222222222222222222222222222222222222222'.toLowerCase() as Address;
const CALL_TO =
  '0x0000000000000000000000000000000000000999'.toLowerCase() as Address;

const baseToken = {
  tokenMetadataURI: 'ar://token-meta',
  createReferral: REF,
  salesConfig: {
    type: 'erc20Mint',
    pricePerToken: '1000000',
    saleStart: 1,
    saleEnd: '18446744073709551615',
    currency: USDC,
  },
  mintToCreatorCount: 1,
  payoutRecipient: ARTIST,
};

const makeBatchInput = () =>
  createMomentBatchSchema.parse({
    contract: { name: 'My Album', uri: 'ar://collection-meta' },
    tokens: [baseToken],
    account: ARTIST,
    channel: 'web',
  });

const makeSingleInput = () =>
  createMomentSchema.parse({
    contract: { name: 'My Album', uri: 'ar://collection-meta' },
    token: baseToken,
    account: ARTIST,
    channel: 'web',
  });

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getWalletLinkedSmartAccount).mockResolvedValue({
    address: '0x0000000000000000000000000000000000000bee',
  } as never);
  vi.mocked(createBatchSetupActions).mockResolvedValue({
    tokenSetupActions: ['0x'],
    fundsRecipient: ARTIST,
  });
  vi.mocked(createMomentBatchCall).mockReturnValue({
    to: CALL_TO,
    data: '0x',
  });
  vi.mocked(publicClient.call).mockResolvedValue('0x');
  vi.mocked(prepareUserOperation).mockResolvedValue({
    userOpHash: '0xuserophash',
    status: 'pending',
  } as never);
});

describe('simulateCreateMomentBatch', () => {
  it('returns contractSimulation success and userOperation fields', async () => {
    const result = await simulateCreateMomentBatch(makeBatchInput());
    expect(result).toEqual({
      contractSimulation: { success: true },
      userOperation: { userOpHash: '0xuserophash', status: 'pending' },
    });
  });

  it('uses base-sepolia when chainId is 84532', async () => {
    const input = createMomentBatchSchema.parse({
      contract: { name: 'My Album', uri: 'ar://collection-meta' },
      tokens: [baseToken],
      account: ARTIST,
      channel: 'web',
      chainId: 84532,
    });
    await simulateCreateMomentBatch(input);
    expect(prepareUserOperation).toHaveBeenCalledWith(
      expect.objectContaining({ network: 'base-sepolia' })
    );
  });

  it('propagates contract call failures', async () => {
    vi.mocked(publicClient.call).mockRejectedValue(new Error('reverted'));
    await expect(simulateCreateMomentBatch(makeBatchInput())).rejects.toThrow(
      'reverted'
    );
  });
});

describe('simulateCreateMoment', () => {
  it('delegates to batch path with one token', async () => {
    const result = await simulateCreateMoment(makeSingleInput());
    expect(result.contractSimulation.success).toBe(true);
    expect(createBatchSetupActions).toHaveBeenCalledTimes(1);
    const callInput = vi.mocked(createBatchSetupActions).mock.calls[0][0].input;
    expect(callInput.tokens).toHaveLength(1);
  });
});
