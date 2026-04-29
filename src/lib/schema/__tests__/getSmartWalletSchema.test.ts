import { describe, it, expect } from 'vitest';
import { getSmartWalletSchema } from '@/lib/schema/getSmartWalletSchema';

const VALID = '0x1234567890123456789012345678901234567890';

describe('getSmartWalletSchema', () => {
  it('parses a valid artist_wallet', () => {
    const parsed = getSmartWalletSchema.safeParse({
      artist_wallet: VALID,
    });
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.artist_wallet).toBe(VALID.toLowerCase());
  });

  it('fails when artist_wallet is missing', () => {
    const parsed = getSmartWalletSchema.safeParse({});
    expect(parsed.success).toBe(false);
  });

  it('fails when artist_wallet is not a hex address', () => {
    const parsed = getSmartWalletSchema.safeParse({
      artist_wallet: 'not-an-address',
    });
    expect(parsed.success).toBe(false);
  });
});
