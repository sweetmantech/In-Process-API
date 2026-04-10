import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/in_process_payments/selectMax', () => ({
  selectMax: vi.fn(),
}));

import { selectMaxTransferredAt } from '../selectMaxTransferredAt';
import { selectMax } from '@/lib/supabase/in_process_payments/selectMax';

const mockSelectMax = vi.mocked(selectMax);

describe('selectMaxTransferredAt', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns null when selectMax returns null', async () => {
    mockSelectMax.mockResolvedValue(null);
    expect(await selectMaxTransferredAt()).toBeNull();
  });

  it('converts ISO string to milliseconds', async () => {
    mockSelectMax.mockResolvedValue('2023-01-01T00:00:00.000Z');
    expect(await selectMaxTransferredAt()).toBe(
      new Date('2023-01-01T00:00:00.000Z').getTime()
    );
  });

  it('calls selectMax with transferred_at', async () => {
    mockSelectMax.mockResolvedValue(null);
    await selectMaxTransferredAt();
    expect(mockSelectMax).toHaveBeenCalledWith('transferred_at');
  });
});
