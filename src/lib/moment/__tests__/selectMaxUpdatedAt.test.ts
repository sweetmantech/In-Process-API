import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/in_process_moments/selectMax', () => ({
  selectMax: vi.fn(),
}));

import { selectMaxUpdatedAt } from '../selectMaxUpdatedAt';
import { selectMax } from '@/lib/supabase/in_process_moments/selectMax';

const mockSelectMax = vi.mocked(selectMax);

describe('selectMaxUpdatedAt (moments)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns null when selectMax returns null', async () => {
    mockSelectMax.mockResolvedValue(null);
    expect(await selectMaxUpdatedAt()).toBeNull();
  });

  it('converts ISO string to milliseconds', async () => {
    mockSelectMax.mockResolvedValue('2023-01-01T00:00:00.000Z');
    expect(await selectMaxUpdatedAt()).toBe(
      new Date('2023-01-01T00:00:00.000Z').getTime()
    );
  });

  it('calls selectMax with updated_at', async () => {
    mockSelectMax.mockResolvedValue(null);
    await selectMaxUpdatedAt();
    expect(mockSelectMax).toHaveBeenCalledWith('updated_at');
  });
});
