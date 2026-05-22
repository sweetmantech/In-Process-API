import { describe, it, expect } from 'vitest';
import { createCollectionSchema } from '@/lib/schema/createCollectionSchema';

const ACCOUNT = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const ACCOUNT_B = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';
const validItem = { uri: 'ipfs://test', name: 'Test Collection' };

describe('createCollectionSchema', () => {
  it('accepts valid input with a single collection', () => {
    const result = createCollectionSchema.safeParse({
      account: ACCOUNT,
      collection: validItem,
    });
    expect(result.success).toBe(true);
  });

  it('normalizes account address to lowercase', () => {
    const result = createCollectionSchema.safeParse({
      account: '0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      collection: validItem,
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.account).toBe(ACCOUNT);
  });

  it('rejects missing account', () => {
    const result = createCollectionSchema.safeParse({
      collection: validItem,
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid account address', () => {
    const result = createCollectionSchema.safeParse({
      account: 'not-an-address',
      collection: validItem,
    });
    expect(result.success).toBe(false);
  });

  it('rejects item with missing uri', () => {
    const result = createCollectionSchema.safeParse({
      account: ACCOUNT,
      collection: { name: 'Test' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects item with missing name', () => {
    const result = createCollectionSchema.safeParse({
      account: ACCOUNT,
      collection: { uri: 'ipfs://test' },
    });
    expect(result.success).toBe(false);
  });

  it('accepts chainId when provided', () => {
    const result = createCollectionSchema.safeParse({
      account: ACCOUNT,
      collection: validItem,
      chainId: 8453,
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.chainId).toBe(8453);
  });

  it('defaults chainId when omitted', () => {
    const result = createCollectionSchema.safeParse({
      account: ACCOUNT,
      collection: validItem,
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.chainId).toBeTypeOf('number');
  });

  it('coerces chainId string to number', () => {
    const result = createCollectionSchema.safeParse({
      account: ACCOUNT,
      collection: validItem,
      chainId: '84532',
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.chainId).toBe(84532);
  });

  it('accepts collection with optional splits omitted', () => {
    const result = createCollectionSchema.safeParse({
      account: ACCOUNT,
      collection: validItem,
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.collection.splits).toBeUndefined();
  });

  it('accepts valid splits with 2 recipients totalling 100%', () => {
    const result = createCollectionSchema.safeParse({
      account: ACCOUNT,
      collection: {
        ...validItem,
        splits: [
          { address: ACCOUNT, percentAllocation: 60 },
          { address: ACCOUNT_B, percentAllocation: 40 },
        ],
      },
    });
    expect(result.success).toBe(true);
  });

  it('rejects splits with only one recipient', () => {
    const result = createCollectionSchema.safeParse({
      account: ACCOUNT,
      collection: {
        ...validItem,
        splits: [{ address: ACCOUNT, percentAllocation: 100 }],
      },
    });
    expect(result.success).toBe(false);
  });

  it('rejects splits totalling less than 100%', () => {
    const result = createCollectionSchema.safeParse({
      account: ACCOUNT,
      collection: {
        ...validItem,
        splits: [
          { address: ACCOUNT, percentAllocation: 60 },
          { address: ACCOUNT_B, percentAllocation: 30 },
        ],
      },
    });
    expect(result.success).toBe(false);
  });
});
