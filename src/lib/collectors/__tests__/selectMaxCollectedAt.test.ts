import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/in_process_collectors/selectMax', () => ({
  selectMax: vi.fn(),
}));

import { selectMaxCollectedAt } from '../selectMaxCollectedAt';
import { selectMax } from '@/lib/supabase/in_process_collectors/selectMax';

const mockSelectMax = vi.mocked(selectMax);

describe('selectMaxCollectedAt', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns null when selectMax returns null', async () => {
    mockSelectMax.mockResolvedValue(null);
    expect(await selectMaxCollectedAt()).toBeNull();
  });

  it('converts ISO string to milliseconds', async () => {
    mockSelectMax.mockResolvedValue('2023-01-01T00:00:00.000Z');
    const result = await selectMaxCollectedAt();
    expect(result).toBe(new Date('2023-01-01T00:00:00.000Z').getTime());
  });

  it('calls selectMax with collected_at', async () => {
    mockSelectMax.mockResolvedValue(null);
    await selectMaxCollectedAt();
    expect(mockSelectMax).toHaveBeenCalledWith('collected_at');
  });
});
