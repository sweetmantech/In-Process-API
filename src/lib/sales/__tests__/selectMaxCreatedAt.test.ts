import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/in_process_sales/selectMax', () => ({
  selectMax: vi.fn(),
}));

import { selectMaxCreatedAt } from '../selectMaxCreatedAt';
import { selectMax } from '@/lib/supabase/in_process_sales/selectMax';

const mockSelectMax = vi.mocked(selectMax);

describe('selectMaxCreatedAt', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns null when selectMax returns null', async () => {
    mockSelectMax.mockResolvedValue(null);
    expect(await selectMaxCreatedAt()).toBeNull();
  });

  it('converts ISO string to milliseconds', async () => {
    mockSelectMax.mockResolvedValue('2023-01-01T00:00:00.000Z');
    expect(await selectMaxCreatedAt()).toBe(
      new Date('2023-01-01T00:00:00.000Z').getTime()
    );
  });

  it('calls selectMax with created_at', async () => {
    mockSelectMax.mockResolvedValue(null);
    await selectMaxCreatedAt();
    expect(mockSelectMax).toHaveBeenCalledWith('created_at');
  });
});
