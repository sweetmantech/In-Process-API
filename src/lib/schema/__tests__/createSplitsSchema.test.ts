import { describe, it, expect } from 'vitest';
import { createSplitsSchema } from '../createSplitsSchema';

const ACCOUNT = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const ACCOUNT_B = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';

const validSplits = [
  { address: ACCOUNT, percentAllocation: 60 },
  { address: ACCOUNT_B, percentAllocation: 40 },
];

describe('createSplitsSchema', () => {
  it('accepts valid splits with 2 recipients totalling 100%', () => {
    const result = createSplitsSchema.safeParse({ splits: validSplits });
    expect(result.success).toBe(true);
  });

  it('rejects missing splits', () => {
    const result = createSplitsSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects splits with only one recipient', () => {
    const result = createSplitsSchema.safeParse({
      splits: [{ address: ACCOUNT, percentAllocation: 100 }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty splits array', () => {
    const result = createSplitsSchema.safeParse({ splits: [] });
    expect(result.success).toBe(false);
  });

  it('rejects splits totalling less than 100%', () => {
    const result = createSplitsSchema.safeParse({
      splits: [
        { address: ACCOUNT, percentAllocation: 60 },
        { address: ACCOUNT_B, percentAllocation: 30 },
      ],
    });
    expect(result.success).toBe(false);
  });

  it('rejects splits with invalid address', () => {
    const result = createSplitsSchema.safeParse({
      splits: [
        { address: 'not-an-address', percentAllocation: 60 },
        { address: ACCOUNT_B, percentAllocation: 40 },
      ],
    });
    expect(result.success).toBe(false);
  });

  it('accepts ENS names as recipient addresses', () => {
    const result = createSplitsSchema.safeParse({
      splits: [
        { address: 'alice.eth', percentAllocation: 50 },
        { address: ACCOUNT_B, percentAllocation: 50 },
      ],
    });
    expect(result.success).toBe(true);
  });
});
