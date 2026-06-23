import { describe, it, expect } from 'vitest';
import hideMomentSchema from '@/lib/schema/hideMomentSchema';

const VALID_UUID = 'a0000000-0000-4000-8000-000000000001';

describe('hideMomentSchema', () => {
  it('accepts a valid UUID', () => {
    const result = hideMomentSchema.safeParse({ momentId: VALID_UUID });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.momentId).toBe(VALID_UUID);
  });

  it('rejects a non-UUID string', () => {
    const result = hideMomentSchema.safeParse({ momentId: 'not-a-uuid' });
    expect(result.success).toBe(false);
  });

  it('rejects a missing momentId', () => {
    const result = hideMomentSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects a numeric momentId', () => {
    const result = hideMomentSchema.safeParse({ momentId: 123 });
    expect(result.success).toBe(false);
  });
});
