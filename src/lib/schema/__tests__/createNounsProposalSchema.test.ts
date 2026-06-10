import { describe, it, expect } from 'vitest';
import { mainnet, sepolia } from 'viem/chains';
import { createNounsProposalSchema } from '../createNounsProposalSchema';

const ACCOUNT = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const ACCOUNT_B = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';
const CONTRACT_ADDR = '0xcccccccccccccccccccccccccccccccccccccccc';

const validToken = {
  tokenMetadataURI: 'ipfs://bafytest',
  createReferral: ACCOUNT,
  salesConfig: {
    type: 'ZoraTimedSaleStrategy',
    pricePerToken: '0',
    saleStart: '0',
    saleEnd: '18446744073709551615',
  },
  mintToCreatorCount: 1,
};

const validBase = {
  chainId: mainnet.id,
  account: ACCOUNT,
  contract: { address: CONTRACT_ADDR },
  tokens: [validToken],
  proposal: { title: 'Test Proposal', description: 'Test Description' },
};

describe('createNounsProposalSchema', () => {
  describe('valid inputs', () => {
    it('accepts minimal valid input with existing contract', () => {
      expect(createNounsProposalSchema.safeParse(validBase).success).toBe(true);
    });

    it('accepts new contract with name and uri', () => {
      const result = createNounsProposalSchema.safeParse({
        ...validBase,
        contract: { name: 'My Collection', uri: 'ipfs://collection' },
      });
      expect(result.success).toBe(true);
    });

    it('accepts sepolia chainId', () => {
      const result = createNounsProposalSchema.safeParse({
        ...validBase,
        chainId: sepolia.id,
      });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.chainId).toBe(sepolia.id);
    });

    it('defaults chainId to mainnet when omitted', () => {
      const { chainId: _, ...withoutChainId } = validBase;
      const result = createNounsProposalSchema.safeParse(withoutChainId);
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.chainId).toBe(mainnet.id);
    });

    it('normalizes account address to lowercase', () => {
      const result = createNounsProposalSchema.safeParse({
        ...validBase,
        account: '0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.account).toBe(ACCOUNT);
    });

    it('accepts multiple tokens', () => {
      const result = createNounsProposalSchema.safeParse({
        ...validBase,
        tokens: [validToken, validToken],
      });
      expect(result.success).toBe(true);
    });

    it('accepts valid splits with 2 recipients totalling 100%', () => {
      const result = createNounsProposalSchema.safeParse({
        ...validBase,
        splits: [
          { address: ACCOUNT, percentAllocation: 60 },
          { address: ACCOUNT_B, percentAllocation: 40 },
        ],
      });
      expect(result.success).toBe(true);
    });

    it('omits splits when not provided', () => {
      const result = createNounsProposalSchema.safeParse(validBase);
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.splits).toBeUndefined();
    });
  });

  describe('required fields', () => {
    it('rejects missing account', () => {
      const { account: _, ...input } = validBase;
      expect(createNounsProposalSchema.safeParse(input).success).toBe(false);
    });

    it('rejects invalid account address', () => {
      expect(
        createNounsProposalSchema.safeParse({
          ...validBase,
          account: 'not-an-address',
        }).success
      ).toBe(false);
    });

    it('rejects empty tokens array', () => {
      expect(
        createNounsProposalSchema.safeParse({ ...validBase, tokens: [] })
          .success
      ).toBe(false);
    });

    it('rejects missing proposal title', () => {
      expect(
        createNounsProposalSchema.safeParse({
          ...validBase,
          proposal: { title: '', description: 'desc' },
        }).success
      ).toBe(false);
    });

    it('rejects missing proposal description', () => {
      expect(
        createNounsProposalSchema.safeParse({
          ...validBase,
          proposal: { title: 'title', description: '' },
        }).success
      ).toBe(false);
    });

    it('rejects unsupported chainId (Base)', () => {
      expect(
        createNounsProposalSchema.safeParse({ ...validBase, chainId: 8453 })
          .success
      ).toBe(false);
    });
  });

  describe('splits validation', () => {
    it('rejects splits with only one recipient', () => {
      expect(
        createNounsProposalSchema.safeParse({
          ...validBase,
          splits: [{ address: ACCOUNT, percentAllocation: 100 }],
        }).success
      ).toBe(false);
    });

    it('rejects splits totalling less than 100%', () => {
      expect(
        createNounsProposalSchema.safeParse({
          ...validBase,
          splits: [
            { address: ACCOUNT, percentAllocation: 60 },
            { address: ACCOUNT_B, percentAllocation: 30 },
          ],
        }).success
      ).toBe(false);
    });

    it('rejects splits with invalid address', () => {
      expect(
        createNounsProposalSchema.safeParse({
          ...validBase,
          splits: [
            { address: 'not-an-address', percentAllocation: 50 },
            { address: ACCOUNT_B, percentAllocation: 50 },
          ],
        }).success
      ).toBe(false);
    });
  });
});
