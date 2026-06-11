import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mainnet } from 'viem/chains';

vi.mock('@/lib/coinbase/getWalletSmartAccount', () => ({
  getWalletSmartAccount: vi.fn(),
}));

vi.mock('@/lib/moment/createBatchSetupActions', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/viem/createMomentBatchCall', () => ({
  default: vi.fn(),
}));

import { getWalletSmartAccount } from '@/lib/coinbase/getWalletSmartAccount';
import createBatchSetupActions from '@/lib/moment/createBatchSetupActions';
import createMomentBatchCall from '@/lib/viem/createMomentBatchCall';
import getNounsProposalActionHandler from '../getNounsProposalActionHandler';
import type { GetNounsProposalActionInput } from '@/lib/schema/getNounsProposalActionSchema';

const ACCOUNT = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' as const;
const CONTRACT = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' as const;
const SMART_ACCOUNT = { address: '0xcccccccccccccccccccccccccccccccccccccccc' };
const MAINNET_GOVERNOR = '0x6f3e6272a167e8accb32072d08e0957f9c79223d';

const baseInput: GetNounsProposalActionInput = {
  chainId: mainnet.id,
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

describe('getNounsProposalActionHandler', () => {
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
  });

  describe('smart account', () => {
    it('resolves smart account from the caller address', async () => {
      await getNounsProposalActionHandler(baseInput);

      expect(getWalletSmartAccount).toHaveBeenCalledWith({ address: ACCOUNT });
    });

    it('passes smart account to createBatchSetupActions', async () => {
      await getNounsProposalActionHandler(baseInput);

      expect(createBatchSetupActions).toHaveBeenCalledWith(
        expect.objectContaining({ smartAccount: SMART_ACCOUNT })
      );
    });
  });

  describe('governor propose args', () => {
    it('returns governor address, propose args, and tx value', async () => {
      const res = await getNounsProposalActionHandler(baseInput);
      const json = await res.json();

      expect(json.governor).toBe(MAINNET_GOVERNOR);
      expect(json.args).toEqual([
        [CONTRACT],
        ['0'],
        [''],
        ['0xbatchcall'],
        '# Test Proposal\n\nDo something onchain.',
      ]);
      expect(json.value).toBe('0');
    });
  });
});
