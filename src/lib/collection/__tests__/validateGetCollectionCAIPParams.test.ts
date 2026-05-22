import { describe, it, expect } from 'vitest';
import { NextResponse } from 'next/server';
import { CHAIN_ID } from '@/lib/consts';
import validateGetCollectionCAIPParams from '@/lib/collection/validateGetCollectionCAIPParams';

const COLLECTION = '0xAbCdEf1234567890AbCdEf1234567890AbCdEf12';

describe('validateGetCollectionCAIPParams', () => {
  it('returns validated data for valid CAIP params', () => {
    const result = validateGetCollectionCAIPParams({
      network: `eip155:${CHAIN_ID}`,
      contract: `erc1155:${COLLECTION}`,
    });

    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as any).collectionAddress).toBe(COLLECTION.toLowerCase());
    expect((result as any).chainId).toBe(CHAIN_ID);
  });

  it('normalizes collectionAddress to lowercase', () => {
    const result = validateGetCollectionCAIPParams({
      network: `eip155:${CHAIN_ID}`,
      contract: `erc1155:${COLLECTION}`,
    });

    expect((result as any).collectionAddress).toBe(COLLECTION.toLowerCase());
  });

  it('returns 400 for unsupported network namespace', () => {
    const result = validateGetCollectionCAIPParams({
      network: `solana:${CHAIN_ID}`,
      contract: `erc1155:${COLLECTION}`,
    });

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 for unsupported asset namespace', () => {
    const result = validateGetCollectionCAIPParams({
      network: `eip155:${CHAIN_ID}`,
      contract: `erc20:${COLLECTION}`,
    });

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 for invalid chainId', () => {
    const result = validateGetCollectionCAIPParams({
      network: 'eip155:not-a-number',
      contract: `erc1155:${COLLECTION}`,
    });

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 for invalid contract address', () => {
    const result = validateGetCollectionCAIPParams({
      network: `eip155:${CHAIN_ID}`,
      contract: 'erc1155:not-an-address',
    });

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });
});
