import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/in_process_airdrops/selectMax', () => ({
  selectMax: vi.fn(),
}));

import { selectMaxUpdatedAt } from '../selectMaxUpdatedAt';
import { selectMax } from '@/lib/supabase/in_process_airdrops/selectMax';

const mockSelectMax = vi.mocked(selectMax);

describe('selectMaxUpdatedAt (airdrops)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns null when selectMax returns null', async () => {
    mockSelectMax.mockResolvedValue(null);
    expect(await selectMaxUpdatedAt()).toBeNull();
  });

  it('returns null when selectMax returns empty string', async () => {
    mockSelectMax.mockResolvedValue('');
    expect(await selectMaxUpdatedAt()).toBeNull();
  });

  it('converts ISO string to milliseconds', async () => {
    mockSelectMax.mockResolvedValue('2023-11-14T22:13:20.000Z');
    const result = await selectMaxUpdatedAt();
    expect(result).toBe(new Date('2023-11-14T22:13:20.000Z').getTime());
  });

  it('calls selectMax with updated_at', async () => {
    mockSelectMax.mockResolvedValue(null);
    await selectMaxUpdatedAt();
    expect(mockSelectMax).toHaveBeenCalledWith('updated_at');
  });
});
