import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/coinbase/getWalletSmartAccount', () => ({
  getWalletSmartAccount: vi.fn(),
}));

vi.mock('@/lib/moment/createBatchSetupActions', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/viem/createMomentBatchCall', () => ({
  default: vi.fn(),
}));

vi.mock('../getNounsProposalCalldata', () => ({
  getNounsProposalCalldata: vi.fn(),
}));

vi.mock('../getNounsProposalThreshold', () => ({
  getNounsProposalThreshold: vi.fn(),
}));

import { getWalletSmartAccount } from '@/lib/coinbase/getWalletSmartAccount';
import createBatchSetupActions from '@/lib/moment/createBatchSetupActions';
import createMomentBatchCall from '@/lib/viem/createMomentBatchCall';
import { getNounsProposalCalldata } from '../getNounsProposalCalldata';
import { getNounsProposalThreshold } from '../getNounsProposalThreshold';
import createNounsProposalHandler from '../createNounsProposalHandler';
import type { CreateNounsProposalInput } from '@/lib/schema/createNounsProposalSchema';

const ACCOUNT = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' as const;
const CONTRACT = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' as const;
const SMART_ACCOUNT = { address: '0xcccccccccccccccccccccccccccccccccccccccc' };

const baseInput: CreateNounsProposalInput = {
  chainId: 1,
  account: ACCOUNT,
  contract: { address: CONTRACT },
  tokens: [
    {
      tokenMetadataURI: 'ipfs://bafytest',
      createReferral: ACCOUNT,
      salesConfig: {
        type: 'ZoraTimedSaleStrategy',
        pricePerToken: BigInt(0),
        saleStart: BigInt(0),
        saleEnd: BigInt('18446744073709551615'),
      },
      mintToCreatorCount: 1,
    },
  ],
  proposal: {
    title: 'Test Proposal',
    description: 'Do something onchain.',
  },
};

const mockTransaction = {
  to: '0xgovernor',
  data: '0xencodedpropose',
  value: '0',
};

describe('createNounsProposalHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getWalletSmartAccount).mockResolvedValue(SMART_ACCOUNT as any);
    vi.mocked(createBatchSetupActions).mockResolvedValue({
      tokenSetupActions: [],
      fundsRecipient: CONTRACT,
    } as any);
    vi.mocked(createMomentBatchCall).mockReturnValue({
      to: CONTRACT,
      data: '0xbatchcall',
    } as any);
    vi.mocked(getNounsProposalCalldata).mockReturnValue(mockTransaction as any);
    vi.mocked(getNounsProposalThreshold).mockResolvedValue(1);
  });

  describe('smart account', () => {
    it('resolves smart account from the caller address', async () => {
      await createNounsProposalHandler(baseInput);

      expect(getWalletSmartAccount).toHaveBeenCalledWith({ address: ACCOUNT });
    });

    it('passes smart account to createBatchSetupActions', async () => {
      await createNounsProposalHandler(baseInput);

      expect(createBatchSetupActions).toHaveBeenCalledWith(
        expect.objectContaining({ smartAccount: SMART_ACCOUNT })
      );
    });
  });

  describe('proposal construction', () => {
    it('formats description as markdown with title and body', async () => {
      await createNounsProposalHandler(baseInput);

      expect(getNounsProposalCalldata).toHaveBeenCalledWith(
        expect.objectContaining({
          description: '# Test Proposal\n\nDo something onchain.',
        })
      );
    });

    it('passes chainId to getNounsProposalCalldata', async () => {
      await createNounsProposalHandler(baseInput);

      expect(getNounsProposalCalldata).toHaveBeenCalledWith(
        expect.objectContaining({ chainId: 1 })
      );
    });
  });

  describe('response', () => {
    it('returns transaction and proposalThreshold in JSON response', async () => {
      vi.mocked(getNounsProposalThreshold).mockResolvedValue(5);

      const res = await createNounsProposalHandler(baseInput);
      const json = await res.json();

      expect(json.transaction).toEqual(mockTransaction);
      expect(json.proposalThreshold).toBe(5);
    });
  });
});
