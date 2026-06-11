import { describe, it, expect } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { mainnet, sepolia } from 'viem/chains';
import validateGetNounsProposalActionBody from '../validateGetNounsProposalActionBody';
import type { GetNounsProposalActionInput } from '@/lib/schema/getNounsProposalActionSchema';

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

const validBody = {
  chainId: mainnet.id,
  account: ACCOUNT,
  contract: { address: CONTRACT_ADDR },
  tokens: [validToken],
  proposal: { title: 'Test Proposal', description: 'Test Description' },
};

const makeRequest = (body: unknown) =>
  new NextRequest('http://localhost/api/nouns', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });

const expectValidResult = (
  result: GetNounsProposalActionInput | NextResponse
): GetNounsProposalActionInput => {
  expect(result).not.toBeInstanceOf(NextResponse);
  return result as GetNounsProposalActionInput;
};

const expectBadRequest = async (
  result: GetNounsProposalActionInput | NextResponse
) => {
  expect(result).toBeInstanceOf(NextResponse);
  expect((result as NextResponse).status).toBe(400);
  const json = await (result as NextResponse).json();
  expect(json.message).toBeDefined();
};

describe('validateGetNounsProposalActionBody', () => {
  it('returns parsed data for a valid body', async () => {
    const result = expectValidResult(
      await validateGetNounsProposalActionBody(makeRequest(validBody))
    );

    expect(result.account).toBe(ACCOUNT);
    expect(result.chainId).toBe(mainnet.id);
    expect(result.contract).toEqual({ address: CONTRACT_ADDR });
    expect(result.tokens).toHaveLength(1);
  });

  it('accepts sepolia chainId', async () => {
    const result = expectValidResult(
      await validateGetNounsProposalActionBody(
        makeRequest({ ...validBody, chainId: sepolia.id })
      )
    );

    expect(result.chainId).toBe(sepolia.id);
  });

  it('accepts new contract with name and uri', async () => {
    const result = expectValidResult(
      await validateGetNounsProposalActionBody(
        makeRequest({
          ...validBody,
          contract: { name: 'My Collection', uri: 'ipfs://collection' },
        })
      )
    );

    expect(result.contract).toEqual({
      name: 'My Collection',
      uri: 'ipfs://collection',
    });
  });

  it('returns 400 for missing account', async () => {
    const { account: _, ...body } = validBody;
    await expectBadRequest(
      await validateGetNounsProposalActionBody(makeRequest(body))
    );
  });

  it('returns 400 for invalid account address', async () => {
    await expectBadRequest(
      await validateGetNounsProposalActionBody(
        makeRequest({ ...validBody, account: 'not-an-address' })
      )
    );
  });

  it('returns 400 for empty tokens array', async () => {
    await expectBadRequest(
      await validateGetNounsProposalActionBody(
        makeRequest({ ...validBody, tokens: [] })
      )
    );
  });

  it('returns 400 for unsupported chainId', async () => {
    await expectBadRequest(
      await validateGetNounsProposalActionBody(
        makeRequest({ ...validBody, chainId: 8453 })
      )
    );
  });

  it('returns 400 for splits totalling less than 100%', async () => {
    await expectBadRequest(
      await validateGetNounsProposalActionBody(
        makeRequest({
          ...validBody,
          splits: [
            { address: ACCOUNT, percentAllocation: 60 },
            { address: ACCOUNT_B, percentAllocation: 30 },
          ],
        })
      )
    );
  });
});
