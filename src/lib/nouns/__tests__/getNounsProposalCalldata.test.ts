import { describe, it, expect } from 'vitest';
import { mainnet, sepolia } from 'viem/chains';
import { type Address, type Hex, decodeFunctionData, getAddress } from 'viem';
import { getNounsProposalCalldata } from '../getNounsProposalCalldata';
import { NOUNS_GOVERNOR_ABI } from '@/lib/abi/nounsAbi';

const TARGET = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' as Address;
const CALLDATA = '0xdeadbeef' as Hex;
const DESCRIPTION = '# My Proposal\n\nDo something onchain.';

describe('getNounsProposalCalldata', () => {
  it('returns the Nouns Governor address as `to` for mainnet', () => {
    const result = getNounsProposalCalldata({
      chainId: mainnet.id,
      target: TARGET,
      calldata: CALLDATA,
      description: DESCRIPTION,
    });
    expect(result.to).toBe('0x6f3e6272a167e8accb32072d08e0957f9c79223d');
  });

  it('returns the Nouns Governor address as `to` for sepolia', () => {
    const result = getNounsProposalCalldata({
      chainId: sepolia.id,
      target: TARGET,
      calldata: CALLDATA,
      description: DESCRIPTION,
    });
    expect(result.to).toBe('0x35d2670d7c8931aacdd37c89ddcb0638c3c44a57');
  });

  it('returns value of "0"', () => {
    const result = getNounsProposalCalldata({
      chainId: mainnet.id,
      target: TARGET,
      calldata: CALLDATA,
      description: DESCRIPTION,
    });
    expect(result.value).toBe('0');
  });

  it('returns ABI-encoded data starting with 0x', () => {
    const result = getNounsProposalCalldata({
      chainId: mainnet.id,
      target: TARGET,
      calldata: CALLDATA,
      description: DESCRIPTION,
    });
    expect(result.data).toMatch(/^0x/);
  });

  it('encodes target as single-element targets array', () => {
    const result = getNounsProposalCalldata({
      chainId: mainnet.id,
      target: TARGET,
      calldata: CALLDATA,
      description: DESCRIPTION,
    });
    const decoded = decodeFunctionData({
      abi: NOUNS_GOVERNOR_ABI,
      data: result.data,
    });
    expect(decoded.functionName).toBe('propose');
    const [targets] = decoded.args as [Address[], bigint[], Hex[], string];
    expect(targets).toEqual([getAddress(TARGET)]);
  });

  it('encodes value as [0n]', () => {
    const result = getNounsProposalCalldata({
      chainId: mainnet.id,
      target: TARGET,
      calldata: CALLDATA,
      description: DESCRIPTION,
    });
    const decoded = decodeFunctionData({
      abi: NOUNS_GOVERNOR_ABI,
      data: result.data,
    });
    const [, values] = decoded.args as [Address[], bigint[], Hex[], string];
    expect(values).toEqual([BigInt(0)]);
  });

  it('encodes calldata as single-element calldatas array', () => {
    const result = getNounsProposalCalldata({
      chainId: mainnet.id,
      target: TARGET,
      calldata: CALLDATA,
      description: DESCRIPTION,
    });
    const decoded = decodeFunctionData({
      abi: NOUNS_GOVERNOR_ABI,
      data: result.data,
    });
    const [, , calldatas] = decoded.args as [
      Address[],
      bigint[],
      Hex[],
      string,
    ];
    expect(calldatas).toEqual([CALLDATA]);
  });

  it('encodes description verbatim', () => {
    const result = getNounsProposalCalldata({
      chainId: mainnet.id,
      target: TARGET,
      calldata: CALLDATA,
      description: DESCRIPTION,
    });
    const decoded = decodeFunctionData({
      abi: NOUNS_GOVERNOR_ABI,
      data: result.data,
    });
    const [, , , desc] = decoded.args as [Address[], bigint[], Hex[], string];
    expect(desc).toBe(DESCRIPTION);
  });

  it('throws for an unsupported chainId', () => {
    expect(() =>
      getNounsProposalCalldata({
        chainId: 8453,
        target: TARGET,
        calldata: CALLDATA,
        description: DESCRIPTION,
      })
    ).toThrow();
  });
});
