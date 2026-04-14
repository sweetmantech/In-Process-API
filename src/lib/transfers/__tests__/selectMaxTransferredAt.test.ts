import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/in_process_transfers/selectMax', () => ({
  selectMax: vi.fn(),
}));

import { selectMaxTransferredAt } from '../selectMaxTransferredAt';
import { selectMax } from '@/lib/supabase/in_process_transfers/selectMax';

const mockSelectMax = vi.mocked(selectMax);

describe('selectMaxTransferredAt', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when selectMax returns null', async () => {
    mockSelectMax.mockResolvedValue(null);
    expect(await selectMaxTransferredAt()).toBeNull();
    expect(mockSelectMax).toHaveBeenCalledWith('transferred_at');
  });

  it('returns epoch ms when selectMax returns a timestamp string', async () => {
    mockSelectMax.mockResolvedValue('2024-01-02T03:04:05.000Z');
    const ms = await selectMaxTransferredAt();
    expect(ms).toBe(new Date('2024-01-02T03:04:05.000Z').getTime());
  });
});
