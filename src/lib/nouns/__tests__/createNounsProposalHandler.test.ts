import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/in_process_wallets/selectWallets', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/artists/getOrCreateArtist', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/smartwallets/getOperationalSmartWallet', () => ({
  getOperationalSmartWallet: vi.fn(),
}));

vi.mock('@/lib/coinbase/getLegacySmartAccount', () => ({
  getLegacySmartAccount: vi.fn(),
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

import selectWallets from '@/lib/supabase/in_process_wallets/selectWallets';
import getOrCreateArtist from '@/lib/artists/getOrCreateArtist';
import { getOperationalSmartWallet } from '@/lib/smartwallets/getOperationalSmartWallet';
import { getLegacySmartAccount } from '@/lib/coinbase/getLegacySmartAccount';
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
      name: 'Test Token',
      description: 'desc',
      animationUrl: 'https://example.com/animation',
      price: '0',
      maxSupply: '100',
    },
  ],
  proposal: {
    title: 'Test Proposal',
    description: 'Do something onchain.',
  },
};

const artistContext = {
  artistId: 'artist-uuid',
  primaryWallet: ACCOUNT,
  wallets: [{ address: ACCOUNT, type: 'external' as const }],
};

const mockTransaction = {
  to: '0xgovernor',
  data: '0xencodedpropose',
  value: '0',
};

describe('createNounsProposalHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

  describe('smart account selection', () => {
    it('uses getOperationalSmartWallet when artistId is found', async () => {
      vi.mocked(selectWallets).mockResolvedValue({
        data: [{ artist_id: 'artist-uuid' }],
      } as any);
      vi.mocked(getOrCreateArtist).mockResolvedValue(artistContext as any);
      vi.mocked(getOperationalSmartWallet).mockResolvedValue(
        SMART_ACCOUNT as any
      );

      await createNounsProposalHandler(baseInput);

      expect(getOperationalSmartWallet).toHaveBeenCalledWith({
        artist: artistContext,
        moment: {
          collectionAddress: CONTRACT,
          chainId: 1,
          tokenId: '0',
        },
      });
      expect(getLegacySmartAccount).not.toHaveBeenCalled();
    });

    it('uses getLegacySmartAccount when no artistId is found', async () => {
      vi.mocked(selectWallets).mockResolvedValue({ data: [] } as any);
      vi.mocked(getLegacySmartAccount).mockResolvedValue(SMART_ACCOUNT as any);

      await createNounsProposalHandler(baseInput);

      expect(getLegacySmartAccount).toHaveBeenCalledWith({ address: ACCOUNT });
      expect(getOperationalSmartWallet).not.toHaveBeenCalled();
      expect(getOrCreateArtist).not.toHaveBeenCalled();
    });

    it('uses getLegacySmartAccount when wallet has no artist_id', async () => {
      vi.mocked(selectWallets).mockResolvedValue({
        data: [{ artist_id: null }],
      } as any);
      vi.mocked(getLegacySmartAccount).mockResolvedValue(SMART_ACCOUNT as any);

      await createNounsProposalHandler(baseInput);

      expect(getLegacySmartAccount).toHaveBeenCalledWith({ address: ACCOUNT });
      expect(getOperationalSmartWallet).not.toHaveBeenCalled();
    });
  });

  describe('proposal construction', () => {
    beforeEach(() => {
      vi.mocked(selectWallets).mockResolvedValue({
        data: [{ artist_id: 'artist-uuid' }],
      } as any);
      vi.mocked(getOrCreateArtist).mockResolvedValue(artistContext as any);
      vi.mocked(getOperationalSmartWallet).mockResolvedValue(
        SMART_ACCOUNT as any
      );
    });

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

    it('passes smart account to createBatchSetupActions', async () => {
      await createNounsProposalHandler(baseInput);

      expect(createBatchSetupActions).toHaveBeenCalledWith(
        expect.objectContaining({ smartAccount: SMART_ACCOUNT })
      );
    });
  });

  describe('response', () => {
    beforeEach(() => {
      vi.mocked(selectWallets).mockResolvedValue({
        data: [{ artist_id: 'artist-uuid' }],
      } as any);
      vi.mocked(getOrCreateArtist).mockResolvedValue(artistContext as any);
      vi.mocked(getOperationalSmartWallet).mockResolvedValue(
        SMART_ACCOUNT as any
      );
    });

    it('returns transaction and proposalThreshold in JSON response', async () => {
      vi.mocked(getNounsProposalThreshold).mockResolvedValue(5);

      const res = await createNounsProposalHandler(baseInput);
      const json = await res.json();

      expect(json.transaction).toEqual(mockTransaction);
      expect(json.proposalThreshold).toBe(5);
    });
  });
});
