import { describe, it, expect } from 'vitest';
import { createCollectionsSchema } from '@/lib/schema/createCollectionsSchema';

const ACCOUNT = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const ACCOUNT_B = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';
const validItem = { uri: 'ipfs://test', name: 'Test Collection' };

describe('createCollectionsSchema', () => {
  it('accepts valid input with one collection', () => {
    const result = createCollectionsSchema.safeParse({
      account: ACCOUNT,
      collections: [validItem],
    });
    expect(result.success).toBe(true);
  });

  it('accepts multiple collection items', () => {
    const result = createCollectionsSchema.safeParse({
      account: ACCOUNT,
      collections: [validItem, { uri: 'ipfs://test2', name: 'Test 2' }],
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.collections).toHaveLength(2);
  });

  it('normalizes account address to lowercase', () => {
    const result = createCollectionsSchema.safeParse({
      account: '0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      collections: [validItem],
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.account).toBe(ACCOUNT);
  });

  it('rejects empty collections array', () => {
    const result = createCollectionsSchema.safeParse({
      account: ACCOUNT,
      collections: [],
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing account', () => {
    const result = createCollectionsSchema.safeParse({
      collections: [validItem],
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid account address', () => {
    const result = createCollectionsSchema.safeParse({
      account: 'not-an-address',
      collections: [validItem],
    });
    expect(result.success).toBe(false);
  });

  it('rejects item with missing uri', () => {
    const result = createCollectionsSchema.safeParse({
      account: ACCOUNT,
      collections: [{ name: 'Test' }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects item with missing name', () => {
    const result = createCollectionsSchema.safeParse({
      account: ACCOUNT,
      collections: [{ uri: 'ipfs://test' }],
    });
    expect(result.success).toBe(false);
  });

  it('accepts items with optional splits omitted', () => {
    const result = createCollectionsSchema.safeParse({
      account: ACCOUNT,
      collections: [validItem],
    });
    expect(result.success).toBe(true);
    if (result.success)
      expect(result.data.collections[0].splits).toBeUndefined();
  });

  it('accepts valid splits with 2 recipients totalling 100%', () => {
    const result = createCollectionsSchema.safeParse({
      account: ACCOUNT,
      collections: [
        {
          ...validItem,
          splits: [
            { address: ACCOUNT, percentAllocation: 60 },
            { address: ACCOUNT_B, percentAllocation: 40 },
          ],
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('rejects splits with only one recipient', () => {
    const result = createCollectionsSchema.safeParse({
      account: ACCOUNT,
      collections: [
        {
          ...validItem,
          splits: [{ address: ACCOUNT, percentAllocation: 100 }],
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it('rejects splits totalling less than 100%', () => {
    const result = createCollectionsSchema.safeParse({
      account: ACCOUNT,
      collections: [
        {
          ...validItem,
          splits: [
            { address: ACCOUNT, percentAllocation: 60 },
            { address: ACCOUNT_B, percentAllocation: 30 },
          ],
        },
      ],
    });
    expect(result.success).toBe(false);
  });
});
